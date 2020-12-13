var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');
var errorManager = require('../services/errorManager');

var parseSingleContraption = function(singleRecord){
  let newData = {
      id: singleRecord.contraption_id,
      type:"contraption",
      attributes:{
        id_code: singleRecord.id_code,
        denomination: singleRecord.denomination,
        type: singleRecord.type,
        work_material:singleRecord.work_material,
        machine: singleRecord.machine,
        purchaseRequest: singleRecord.purchase_request || '',
        order_status: singleRecord.order_status,
        available_qt: singleRecord.available_qt,
        borrowed_qt: singleRecord.borrowed_qt,
        minimum_qt: singleRecord.minimum_qt,
        geometry_length: singleRecord.geometry_length,
        geometry_thickness: singleRecord.geometry_thickness,
        geometry_radius: singleRecord.geometry_radius,
        geometry_diameter: singleRecord.geometry_diameter,
        geometry_degree: singleRecord.geometry_degree
      }
    };
  return newData;
};


var validateOperation = function(qtToAdd, currentQt){
  return currentQt + qtToAdd > 0;
};

router.patch('/contraptions/:id', function(req, res, next) {
  const queryRequest = req.body.data.attributes;
  const contraptionId = req.body.data.id;
  let newData = {data:{}};
  let newState;
  let newQt;

  let updateQuery = `UPDATE contraption
    SET denomination=$1,
    type=$2, machine=$3,
    work_material=$4, id_code=$5,
    available_qt=$6,
    minimum_qt=$7,
    order_status=$8,
    geometry_diameter=$9,
    geometry_radius=$10,
    geometry_length=$11,
    geometry_degree=$12,
    geometry_thickness=$13,
    purchase_request=$14,
    borrowed_qt=$15
    WHERE contraption_id=$16
    RETURNING *`;

  newState = orderManager.getNewState(queryRequest.available_qt, queryRequest.minimum_qt, queryRequest.borrowed_qt);
  console.log('@#@#@#@#@#');
  console.log(newState);

  let updateQUeryParam=[
    queryRequest.denomination,
    queryRequest.type,
    queryRequest.machine,
    queryRequest.work_material,
    queryRequest.id_code,
    queryRequest.available_qt,
    queryRequest.minimum_qt,
    newState,
    queryRequest.geometry_diameter,
    queryRequest.geometry_radius,
    queryRequest.geometry_length,
    queryRequest.geometry_degree,
    queryRequest.geometry_thickness,
    queryRequest.purchase_request || '',
    queryRequest.borrowed_qt,
    contraptionId
  ];

  req.magazutDb.one(updateQuery, updateQUeryParam)
      .then(function(item) {
          history.addModifyRecord(req, contraptionId,updateQUeryParam);
          if(orderManager.shouldSendMail(item.order_status, item.minimum_qt)){
            req.sendOrderMail(item.id_code, item.denomination, item.available_qt, '');
          }

          newData.data = parseSingleContraption(item);
          res.send(newData);
      })
      .catch(function(error) {
        console.log(error);
          res.send(error);
      });
});


module.exports = router;
