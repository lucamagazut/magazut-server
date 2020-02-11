var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');

var parseSingleContraption = function(singleRecord){
  let newData = {
      id: singleRecord.contraption_id,
      type:"contraption",
      attributes:{
        idCode: singleRecord.id_code,
        denomination: singleRecord.denomination,
        type: singleRecord.type,
        material:singleRecord.work_material,
        machine: singleRecord.machine,
        purchaseRequest: singleRecord.purchase_request || '',
        order_status: singleRecord.order_status,
        availableQt: singleRecord.available_qt,
        minQt: singleRecord.minimum_qt,
        "ut-long": singleRecord.geometry_length,
        "ut-thick": singleRecord.geometry_thickness,
        "ut-rad-ins": singleRecord.geometry_radius,
        "ut-dia": singleRecord.geometry_diameter,
        "ut-deg": singleRecord.geometry_degree
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
    available_qt=$6, minimum_qt=$7,
    order_status=$8,
    geometry_diameter=$9,
    geometry_radius=$10,
    geometry_length=$11,
    geometry_degree=$12,
    geometry_thickness=$13,
    purchase_request=$14
    WHERE contraption_id=$15
    RETURNING *`;

  newState = orderManager.getNewState(queryRequest.availableQt, queryRequest.minQt, queryRequest.order_status, 0);
  console.log('@#@#@#@#@#');
  console.log(newState);

  let updateQUeryParam=[
    queryRequest.denomination,
    queryRequest.type,
    queryRequest.machine,
    queryRequest.material,
    queryRequest.idCode,
    queryRequest.availableQt,
    queryRequest.minQt,
    newState,
    queryRequest['ut-dia'],
    queryRequest['ut-rad-ins'],
    queryRequest['ut-long'],
    queryRequest['ut-deg'],
    queryRequest['ut-thick'],
    queryRequest.purchaseRequest,
    contraptionId
  ];


  console.log('updateQuery');
  console.log(updateQuery);
console.log('updateQUeryParam');
  console.log(updateQUeryParam);
  req.magazutDb.one(updateQuery, updateQUeryParam)
      .then(function(item) {
          console.log('@@@@@ entra ok');
          console.log(item);
          history.addModifyRecord(req, contraptionId,updateQUeryParam);
          if(orderManager.sendMail(item.order_status)){
            req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
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
