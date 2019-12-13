var express = require('express');
var router = express.Router();
var orderManager = require('../order-manager');

var illecitPost = function(queryObj){
  if(queryObj.type !== 'contraptions'){
    console.log('RITORNA1');
    return true;
  }
  if(!queryObj.attributes.denomination || queryObj.attributes.denomination.replace(/\s/g, '') === ''){
console.log('RITORNA2');
    return true;
  }
  if(!queryObj.attributes.purchaseRequest || queryObj.attributes.purchaseRequest.replace(/\s/g, '') === ''){
console.log('RITORNA3');
    return true;
  }
  return false;
};

var getSqlQuery = function(){
  let sqlQuery = `
    INSERT INTO contraption (
      denomination,
      type,
      machine,
      work_material,
      id_code,
      purchase_request,
      available_qt,
      minimum_qt,
      order_status,
      geometry_diameter,
      geometry_length,
      geometry_radius,
      geometry_thickness,
      geometry_degree
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING contraption_id,order_status
      `;

      return sqlQuery;

};

var getSqlVars = function(paramsObj){
  var sqlVars = [];
  let availableQt = Number(paramsObj.attributes.availableQt);
  let minQt = Number(paramsObj.attributes.minQt);
  let orderStatus = orderManager.getNewState(availableQt, minQt, 0, 0);



  sqlVars.push(paramsObj.attributes.denomination);
  sqlVars.push(paramsObj.attributes.type);
  sqlVars.push(paramsObj.attributes.machine);
  sqlVars.push(paramsObj.attributes.material);
  sqlVars.push(paramsObj.attributes.idCode);
  sqlVars.push(paramsObj.attributes.purchaseRequest);
  sqlVars.push(availableQt);
  sqlVars.push(minQt);
  sqlVars.push(orderStatus);
  sqlVars.push(paramsObj.attributes['ut-dia']);
  sqlVars.push(paramsObj.attributes['ut-long']);
  sqlVars.push(paramsObj.attributes['ut-rad-ins']);
  sqlVars.push(paramsObj.attributes['ut-thick']);
  sqlVars.push(paramsObj.attributes['ut-deg']);

  return sqlVars;

};

router.post('/contraptions', function(req, res) {
  const requestPostParams = req.body.data;

    console.log(requestPostParams);
  if(illecitPost(requestPostParams)){
    console.log('ILLECITO');
    throw "Wrong Parameters";
  }
  console.log('oltre ILLECITO');

  req.magazutDb.any(getSqlQuery(), getSqlVars(requestPostParams))
    .then(data => {
      console.log('TUTTO OK');

      var objToReturn = {
        'data':
          {
            "id":data[0].contraption_id,
            "type": "contraption",
            attributes:{
              order_status:data[0].order_status
            }
          }
      };

      res.send(objToReturn);
    })
    .catch(error => {
        console.log('ERROR:', error);
        res.send(error);
    });

});

module.exports = router;
