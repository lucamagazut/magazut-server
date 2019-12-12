var express = require('express');
var router = express.Router();

var illecitPost = function(queryObj){
  if(queryObj.type !== 'contraptions'){
    console.log('RITORNA1');
    return true;
  }
  if(!queryObj.attributes.denomination || queryObj.attributes.denomination.replace(/\s/g, '') === ''){
console.log('RITORNA2');
    return true;
  }
  if(!queryObj.attributes.denomination){
console.log('RITORNA2B');
    return true;
  }
  if(!queryObj.attributes.purchaseRequest || queryObj.attributes.purchaseRequest.replace(/\s/g, '') === ''){
console.log('RITORNA3');
    return true;
  }
  if(queryObj.attributes.availableQt < 1){
    console.log('RITORNA4');
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
      order_state,
      geometry_diameter,
      geometry_length,
      geometry_radius,
      geometry_thickness,
      geometry_degree
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING contraption_id
      `;

      return sqlQuery;

};

var getSqlVars = function(paramsObj){
  var sqlVars = [];
  let orderState;
  let availableQt = Number(paramsObj.attributes.availableQt);
  let minQt = Number(paramsObj.attributes.minQt);

  if(availableQt === 0){
    orderState = 0;
  }else if(availableQt < minQt){
    orderState = 2;
  }else{
    orderState = 1;
  }

  sqlVars.push(paramsObj.attributes.denomination);
  sqlVars.push(paramsObj.attributes.type);
  sqlVars.push(paramsObj.attributes.machine);
  sqlVars.push(paramsObj.attributes.material);
  sqlVars.push(paramsObj.attributes.idCode);
  sqlVars.push(paramsObj.attributes.purchaseRequest);
  sqlVars.push(availableQt);
  sqlVars.push(minQt);
  sqlVars.push(orderState);
  sqlVars.push(paramsObj.attributes['ut-dia']);
  sqlVars.push(paramsObj.attributes['ut-long']);
  sqlVars.push(paramsObj.attributes['ut-rad-ins']);
  sqlVars.push(paramsObj.attributes['ut-thick']);
  sqlVars.push(paramsObj.attributes['ut-deg']);

  return sqlVars;

};

router.post('/predictive-filters', function(req, res) {
  const requestPostParams = req.body.data;
  var descriptionParam = requestPostParams.attributes.description;
  var api_idsParam = requestPostParams.attributes.api_ids;
  var db_column_to_searchParam = requestPostParams.attributes.db_column_to_search;
  var parent_ps_idParam = requestPostParams.attributes.parent_ps_id;
  var tokensParam = requestPostParams.attributes.tokens;
  var sqlVars = [];

  sqlVars.push(descriptionParam, api_idsParam, db_column_to_searchParam, parent_ps_idParam, tokensParam);

  var sqlQuery = `INSERT INTO predictive_search (
    description,
    api_ids,
    db_column_to_search,
    parent_ps_id,
    tokens)
    values ($1,$2,$3,$4,$5)
    RETURNING ps_id
  `;

  req.magazutDb.any(sqlQuery, sqlVars)
    .then(data => {
      console.log('TUTTO OK');

      var objToReturn = {
        'data':
          {
            "id":data[0].ps_id,
            "type": "predictive-filter",
          }
      };

      res.send(objToReturn);
    })
    .catch(error => {
        console.log('ERROR:', error);
    });

});

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
          }
      };

      res.send(objToReturn);
    })
    .catch(error => {
        console.log('ERROR:', error);
    });

});

module.exports = router;
