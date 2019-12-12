var express = require('express');
var router = express.Router();
var orderManager = require('../order-manager');


router.put(['/charge', '/discharge'], function(req, res, next) {
  const queryRequest = req.query;
  const contraptionId = queryRequest.id;
  const contraptionQtToAdd = req.path === '/discharge' ? -(Number(queryRequest.qt)) : Number(queryRequest.qt);
  let newData = {data:[]};
  let newObjContraction = {
    id:contraptionId,
    type:'contraption',
    attributes:{}
  };
  let newState;
  let newQt;

  newData.data.push(newObjContraction);
  var sqlQuerySelect = `SELECT minimum_qt, available_qt, order_status FROM contraption WHERE contraption_id = ${contraptionId}`;

  console.log(sqlQuerySelect)
  req.magazutDb.task(t => {
    return t.one(sqlQuerySelect,)
      .then(item => {
        if(!orderManager.validate(item.available_qt, contraptionQtToAdd)){
          return this.reject();
        }
        newState = orderManager.getNewState(item.available_qt, item.minimum_qt, item.order_status, contraptionQtToAdd);
        newQt = item.available_qt + contraptionQtToAdd;
        let updateQuery = `UPDATE contraption SET available_qt = ${newQt}, order_status = ${newState}
          WHERE contraption_id = ${contraptionId}`;

        return t.any(updateQuery);
      });
    })
    .then(events => {
      newObjContraction.attributes.availableQt = newQt;
      newObjContraction.attributes.state = newState;
      res.send(newData);
    })
    .catch(error => {
      console.log('errore');
        res.send(error);
    });
});

module.exports = router;
