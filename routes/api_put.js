var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');


router.put(['/charge', '/discharge'], function(req, res, next) {
  const queryRequest = req.query;
  const contraptionId = queryRequest.id;
  const operator = queryRequest.op;
  const isCharging = req.path === '/charge';
  const contraptionQtToAdd =  isCharging ? Number(queryRequest.qt) : -(Number(queryRequest.qt));
  var newData = {data:[]};
  var newObjContraction = {
    id:contraptionId,
    type:'contraption',
    attributes:{}
  };
  var lastSqlQuery = '';

  newData.data.push(newObjContraction);
  var sqlQuerySelect = `SELECT minimum_qt, available_qt, order_status FROM contraption WHERE contraption_id = $1`;
  lastSqlQuery = sqlQuerySelect;
  console.log(sqlQuerySelect)
  req.magazutDb.task(t => {
    return t.one(sqlQuerySelect, [contraptionId])
      .then(item => {
        if(!orderManager.validate(item.available_qt, contraptionQtToAdd)){
          console.log('entra qui');
          throw {name:'error',type:'invalidRequest'};
        }
        let newState = orderManager.getNewState(item.available_qt, item.minimum_qt, item.order_status, contraptionQtToAdd);
        let newQt = item.available_qt + contraptionQtToAdd;
        let updateQuery = `UPDATE contraption SET available_qt = $1, order_status = $2
          WHERE contraption_id = $3 RETURNING contraption_id, denomination, id_code, purchase_request, available_qt, minimum_qt, order_status`;

        lastSqlQuery = updateQuery;
        return t.one(updateQuery, [newQt, newState, contraptionId]);
      });
    })
    .then(item => {
      newObjContraction.attributes.availableQt = item.available_qt;
      newObjContraction.attributes.order_status = item.order_status;

      if(orderManager.sendMail(item.order_status, item.available_qt, item.minimum_qt)){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      }

      if(isCharging){
        console.log(213293129);
        history.addChargingRecord(req);
      }else{
        console.log(98738383);
        history.addUnchargingRecord(req);
      }
      res.send(newData);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        history.addErrorRecord(req, contraptionId, lastSqlQuery, error);
        res.send(error);
    });
});



router.put('/order', function(req, res, next) {
  const queryRequest = req.query;
  const contraptionId = queryRequest.id;
  const order_status = queryRequest.order_status;
  var newOrderStatus;

  req.magazutDb.task(t => {
    return t.one(`SELECT minimum_qt, available_qt, order_status FROM contraption WHERE contraption_id = $1`, [contraptionId])
      .then(item => {
        newOrderStatus = orderManager.changeNewStatus(item.available_qt, item.minQt, item.order_status, order_status);
        console.log('@@@@@@@@@@@@ newOrderStatus @@@@@@@@@@@');
        console.log(newOrderStatus);
        return t.one('UPDATE contraption SET order_status=$2 WHERE contraption_id=$1 RETURNING *', [contraptionId, newOrderStatus]);
      });
    })
    .then((item) => {
      if(orderManager.sendMail(newOrderStatus)){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      }
      history.addModifyRecord(req, contraptionId, {order_status:newOrderStatus});
      res.send({data:{type:'contraption',id:contraptionId,attributes:{order_status:newOrderStatus}}});
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        // history.addErrorRecord(req, contraptionId, lastSqlQuery, error);
        res.send(error);
    });

});


module.exports = router;
