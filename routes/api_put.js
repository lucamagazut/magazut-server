var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');
var errorManager = require('../services/errorManager');


router.put('/charge', function(req, res, next) {
  const queryRequest = req.query;
  const contraption_id = queryRequest.contraption_id;
  const qt_to_add =  Number(queryRequest.qt_to_add);
  var lastSqlQuery = '';

  let newStatus = orderManager.getStateInCharging(queryRequest, qt_to_add);

  var sqlQuery = `

    UPDATE contraption SET available_qt = available_qt + $2, order_status=$3
    WHERE contraption_id = $1

    RETURNING *

    `;
  lastSqlQuery = sqlQuery;
  console.log(sqlQuery)
  req.magazutDb.one(sqlQuery,[contraption_id, qt_to_add, newStatus])
    .then(item => {

      let newData = {
        data:{
          type:'contraption',
          id:contraption_id,
          attributes:item
        }
      };

      res.send(newData);
      history.addHistoryRecord({employee_id:0, transaction_id:1, involved_quantity:qt_to_add,contraption_id:contraption_id},req);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);

        history.addErrorRecord(req, contraption_id, lastSqlQuery, error);
        res.send(error);
    });
});


router.put('/discharge', function(req, res, next) {
  const queryRequest = req.query;
  const contraption_id = queryRequest.contraption_id;
  const qt_to_remove =  Number(queryRequest.qt_to_remove);
  const minimum_qt = Number(queryRequest.minimum_qt);
  const available_qt = Number(queryRequest.available_qt);
  const borrowed_qt = Number(queryRequest.borrowed_qt);
  const employee_id = Number(queryRequest.employee_id);
  const order_status = Number(queryRequest.order_status);


  var lastSqlQuery = '';

  // dobbiamo:
  // validare se farlo
  // sapere se cambia lo stato
  // sapere se mandare la mail
  // sapere se si può fare
  // modifcare le due cosette

  if(qt_to_remove > (available_qt - borrowed_qt)){
    throw errorManager.getError("Richiesta non valida", "La quantità da rimuovere deve essere inferiore a quella disponibile in magazzino.", 403);
  }

  let newOrderStatus = orderManager.getStateInDischarging(queryRequest, qt_to_remove);
  let shouldSendMail = orderManager.shouldSendMailInDischarging(newOrderStatus, minimum_qt);

  var sqlQuery = `

    UPDATE contraption SET available_qt = available_qt - $2, order_status=$3
    WHERE contraption_id = $1

    RETURNING *

    `;
  lastSqlQuery = sqlQuery;
  console.log(sqlQuery)
  req.magazutDb.one(sqlQuery,[contraption_id, qt_to_remove, newOrderStatus])
    .then(item => {

      let newData = {
        data:{
          type:'contraption',
          id:contraption_id,
          attributes:item
        }
      };

      res.send(newData);
      console.log(`shouldSendMail ${shouldSendMail}`);
      if(shouldSendMail){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      }
      history.addHistoryRecord({employee_id:employee_id, transaction_id:2, involved_quantity:qt_to_remove,contraption_id:contraption_id},req);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);

        history.addErrorRecord(req, contraption_id, lastSqlQuery, error);
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
          throw errorManager.getError("Richiesta non valida", "Il cambiamento di stato è stato annullato", 403);
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
