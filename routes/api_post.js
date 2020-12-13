var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');

var illecitPost = function(queryObj){
  if(queryObj.type !== 'contraptions'){
    console.log('RITORNA1');
    return true;
  }
  if(!queryObj.attributes.denomination || queryObj.attributes.denomination.replace(/\s/g, '') === ''){
console.log('RITORNA2');
    return true;
  }
//   if(!queryObj.attributes.purchaseRequest || queryObj.attributes.purchaseRequest.replace(/\s/g, '') === ''){
// console.log('RITORNA3');
//     return true;
//   }
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
      borrowed_qt,
      minimum_qt,
      order_status,
      geometry_diameter,
      geometry_length,
      geometry_radius,
      geometry_thickness,
      geometry_degree
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING contraption_id,order_status,denomination,available_qt, borrowed_qt,purchase_request,id_code
      `;

      return sqlQuery;

};

var getSqlVars = function(paramsObj){
  var sqlVars = [];
  let available_qt = Number(paramsObj.attributes.available_qt);
  let borrowed_qt = 0;
  let minimum_qt = Number(paramsObj.attributes.minimum_qt);
  let orderStatus = orderManager.getNewState(available_qt, minimum_qt, borrowed_qt);

  sqlVars.push(paramsObj.attributes.denomination);
  sqlVars.push(paramsObj.attributes.type);
  sqlVars.push(paramsObj.attributes.machine);
  sqlVars.push(paramsObj.attributes.work_material);
  sqlVars.push(paramsObj.attributes.id_code);
  sqlVars.push(paramsObj.attributes.purchaseRequest || '');
  sqlVars.push(available_qt);
  sqlVars.push(borrowed_qt);
  sqlVars.push(minimum_qt);
  sqlVars.push(orderStatus);
  sqlVars.push(paramsObj.attributes.geometry_diameter);
  sqlVars.push(paramsObj.attributes.geometry_length);
  sqlVars.push(paramsObj.attributes.geometry_radius);
  sqlVars.push(paramsObj.attributes.geometry_thickness);
  sqlVars.push(paramsObj.attributes.geometry_degree);

  return sqlVars;

};

router.post('/contraptions', function(req, res) {
  const requestPostParams = req.body.data;

    console.log(requestPostParams);
  if(illecitPost(requestPostParams)){
    console.log('ILLECITO');
    history.addErrorRecord(req, 0, '', {"description":"Validazione fallita"});
    throw "Wrong Parameters";
  }
  console.log('oltre ILLECITO');

  let sqlQuery = getSqlQuery();
  req.magazutDb.one(sqlQuery, getSqlVars(requestPostParams))
    .then(item => {
      console.log('TUTTO OK');
      // history.addCreatingRecord(req, item.contraption_id);
      // if(orderManager.sendMail(item.order_status)){
      //   req.sendOrderMail(item.id_code, item.denomination, item.available_qt, item.purchase_request);
      // }
      if(orderManager.shouldSendMail(item.order_status, item.minimum_qt)){
        req.sendOrderMail(item.id_code, item.denomination, item.available_qt, '');
      }
      var objToReturn = {
        'data':
          {
            "id":item.contraption_id,
            "type": "contraption",
            attributes:{
              order_status:item.order_status
            }
          }
      };

      res.send(objToReturn);
    })
    .catch(error => {
        console.log('ERROR:', error);
        history.addErrorRecord(req, 0, sqlQuery, error);
        res.send(error);
    });

});


router.post('/send-mail', function(req, res) {
  const postParams = req.body;
  const to = postParams.email;
  const text = postParams.text;
  const subject = postParams.subject;

  let newData = {data:{}};

  req.sendMail(to, subject, text);

  newData.data = {result:'success'};
  res.send(newData);
});


module.exports = router;
