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
  let newData = {data:[]};
  let newObjContraction = {
    id:contraptionId,
    type:'contraption',
    attributes:{}
  };
  var lastSqlQuery = '';
  let newState;
  let newQt;

  newData.data.push(newObjContraction);
  var sqlQuerySelect = `SELECT minimum_qt, available_qt, order_status FROM contraption WHERE contraption_id = ${contraptionId}`;
  lastSqlQuery = sqlQuerySelect;
  console.log(sqlQuerySelect)
  req.magazutDb.task(t => {
    return t.one(sqlQuerySelect)
      .then(item => {
        if(!orderManager.validate(item.available_qt, contraptionQtToAdd)){
          console.log('entra qui');
          throw {name:'error',type:'invalidRequest'};
        }
        newState = orderManager.getNewState(item.available_qt, item.minimum_qt, item.order_status, contraptionQtToAdd);
        newQt = item.available_qt + contraptionQtToAdd;
        let updateQuery = `UPDATE contraption SET available_qt = ${newQt}, order_status = ${newState}
          WHERE contraption_id = ${contraptionId}`;

        lastSqlQuery = updateQuery;
        return t.any(updateQuery);
      });
    })
    .then(events => {
      newObjContraction.attributes.availableQt = newQt;
      newObjContraction.attributes.order_status = newState;
      if(isCharging){
        history.addChargingRecord(req);
      }else{
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
  console.log('cacca1');
  req.magazutDb.none('UPDATE contraption SET order_status=$2 WHERE contraption_id=$1', [contraptionId, order_status])
      .then(function() {
        console.log('cacca2');
        history.addModifyRecord(req, contraptionId, {order_status:order_status});
        res.send({data:{type:'contraption',id:contraptionId,attributes:{order_status:order_status}}});
      })
      .catch(function(error) {
        console.log('errore');
        console.log(error);
          res.send(error);
      });
});


module.exports = router;
