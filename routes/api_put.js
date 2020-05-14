var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');


router.put(['/charge', '/discharge'], function(req, res, next) {
  const queryRequest = req.query;
  const contraptionId = queryRequest.id;
  const operator = queryRequest.op;
  const isBorrowed = queryRequest.is_borrowed == 'true';
  const isReturned = queryRequest.is_returned == 'true';
  const isCharging = req.path === '/charge';
  const qtToAdd =  Number(queryRequest.qt);
  var newData = {data:[]};
  var newObjContraction = {
    id:contraptionId,
    type:'contraption',
    attributes:{}
  };
  var lastSqlQuery = '';

  newData.data.push(newObjContraction);
  var sqlQuerySelect = `SELECT minimum_qt, available_qt, borrowed_qt, order_status FROM contraption WHERE contraption_id = $1`;
  lastSqlQuery = sqlQuerySelect;
  console.log(sqlQuerySelect)
  req.magazutDb.task(t => {
    return t.one(sqlQuerySelect, [contraptionId])
      .then(item => {
        if(!orderManager.validate(item.available_qt, qtToAdd, isCharging)){
          console.log('entra qui');
          throw {name:'error',type:'invalidRequest'};
        }

        console.log(item);

        let newStateAndQt = orderManager.getNewStateAndQt(item, qtToAdd, isCharging, isBorrowed, isReturned);

        let updateQuery = `UPDATE contraption SET available_qt = $1, borrowed_qt=$2, order_status = $3
          WHERE contraption_id = $4 RETURNING contraption_id, denomination, id_code, available_qt, minimum_qt, borrowed_qt, order_status`;

        lastSqlQuery = updateQuery;
        return t.one(updateQuery, [newStateAndQt.available_qt, newStateAndQt.borrowed_qt, newStateAndQt.order_status, contraptionId]);
      });
    })
    .then(item => {
      newObjContraction.attributes.availableQt = item.available_qt;
      newObjContraction.attributes.borrowed_qt = item.borrowed_qt;
      newObjContraction.attributes.order_status = item.order_status;

      if(orderManager.shouldSendMail(item.order_status, item.minimum_qt)){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      }

      if(isCharging){
        console.log('addChargingRecord');
        history.addChargingRecord(req, isReturned);
      }else{
        console.log('addUnchargingRecord');
        history.addUnchargingRecord(req, isBorrowed);
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

  req.magazutDb.task(t => {
    return t.one(`SELECT minimum_qt, available_qt, borrowed_qt, order_status FROM contraption WHERE contraption_id = $1`, [contraptionId])
      .then(item => {
        let newOrderStatus;
        let sqlQuery = '';
        if(orderManager.isDismissing(order_status)){

          console.log('dismette');
          console.log(item.available_qt);
          console.log(item.minimum_qt);
          console.log(item.borrowed_qt);
          newOrderStatus = orderManager.getNewState(item.available_qt,  item.minimum_qt, item.borrowed_qt);
          sqlQuery = 'UPDATE contraption SET order_status=$2, minimum_qt=0 WHERE contraption_id=$1 RETURNING *';
        }
        else if(orderManager.validateChangingStatus(item.available_qt, item.minimum_qt, order_status)){
          newOrderStatus = order_status;
          sqlQuery = 'UPDATE contraption SET order_status=$2 WHERE contraption_id=$1 RETURNING *';
        }
        else{
          throw {name:'error',type:'invalidRequest'};
        }
        return t.one(sqlQuery, [contraptionId, newOrderStatus]);
      });
    })
    .then((item) => {
      if(orderManager.shouldSendMail(item.order_status, item.minimum_qt)){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      }
      history.addModifyRecord(req, contraptionId, {order_status:item.order_status});
      res.send({data:{type:'contraption',id:contraptionId,attributes:{order_status:item.order_status}}});
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        // history.addErrorRecord(req, contraptionId, lastSqlQuery, error);
        res.send(error);
    });

});


module.exports = router;
