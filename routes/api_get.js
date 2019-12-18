var express = require('express');
var router = express.Router();

var parseOperator = function(data){
  let newData = {data:[]};
  data.forEach(element => {
    newData.data.push({
      id: element.employee_id,
      type:"operator",
      attributes:{
        name: element.name,
        surname: element.second_name
      }
    });
  });
  return newData;
};

var parseMachine = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.machine_id,
      type:"machine",
      attributes:{
        name: element.name,
        tokens: element.tokens
      }
    });
  });
  return newData;
};


var parseMaterial = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.material_id,
      type:"work-material",
      attributes:{
        name: element.name,
        tokens: element.tokens
      }
    });
  });
  return newData;
};

var parseContraptionType = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.contraption_type_id,
      type:"contraption-type",
      attributes:{
        name: element.name,
        tokens: element.tokens
      }
    });
  });
  return newData;
};

var parseContraption = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.contraption_id,
      type:"contraption",
      attributes:{
        idCode: element.id_code,
        denomination: element.denomination,
        type: element.type,
        material:element.work_material,
        machine: element.machine,
        purchaseRequest: element.purchase_request,
        order_status: element.order_status,
        availableQt: element.available_qt,
        minQt: element.minimum_qt,
        "ut-long": element.geometry_length,
        "ut-thick": element.geometry_thickness,
        "ut-rad-ins": element.geometry_radius,
        "ut-dia": element.geometry_diameter,
        "ut-deg": element.geometry_degree
      }
    });
  });
  return newData;
};

var parseIdCode = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.id_code_id,
      type:"id-code",
      attributes:{
        code: element.snippet,
        tokens: element.tokens
      }
    });
  });
  return newData;
};


var parseStatus = function(data){
  let newData = [];
  data.forEach(element => {
    newData.push({
      id: element.order_status_id,
      type:"order-status",
      attributes:{
        order_status_name: element.order_status_name,
      }
    });
  });
  return newData;
};

router.get('/operators', function(req, res, next) {
  req.magazutDb.any('SELECT * FROM employee', [true])
      .then(function(data) {
          res.send(parseOperator(data));
      })
      .catch(function(error) {
          res.send('non funzia');
      });
});

router.get('/search-filters', function(req, res, next) {
  let data = {data:[]};
  req.magazutDb.task(t => {
        // this.ctx = task config + state context;
        return t.any('SELECT * FROM machine ORDER BY machine_id ASC')
        .then(machines => {
          // console.log(parseMachine(machines))
            data.data = data.data.concat(parseMachine(machines));
            return t.any('SELECT * FROM material');
        })
        .then(materials => {
            data.data = data.data.concat(parseMaterial(materials));
            return t.any('SELECT * FROM contraption_type');
        })
        .then(contraption_type => {
            data.data = data.data.concat(parseContraptionType(contraption_type));
            return t.any('SELECT * FROM order_status');
        })
        .then(order_status => {
            data.data = data.data.concat(parseStatus(order_status));
            return this;
        });
    })
    .then(events => {
        res.send(data);
    })
    .catch(error => {
        res.send('error \n' + error);
    });
});

router.get('/contraptions/:id(\\d+)/', function(req, res, next) {
  let newData = {data:{}};
  req.magazutDb.any('SELECT * FROM contraption WHERE contraption_id=$1', req.params.id)
      .then(function(data) {
          newData.data = parseContraption(data)[0];
          res.send(newData);
      })
      .catch(function(error) {
          res.send(error);
      });
});


router.get('/contraptions', function(req, res, next) {
  const queryRequest = req.query;
  let data = {data:[]};
  var sqlQuery = '';

  if(queryRequest.filter){
    if(queryRequest.filter == 'runout'){
      sqlQuery = 'SELECT * FROM contraption WHERE order_status!=1 AND contraption_id!=0';
    }
  }else{
    let radiusSearch = queryRequest['geometry_radius'] ? ` AND geometry_radius = ${queryRequest['geometry_radius']}` : '';
    let degreeSearch = queryRequest['geometry_degree'] ? ` AND geometry_degree = ${queryRequest['geometry_degree']}` : '';
    let thicknessSearch = queryRequest['geometry_thickness'] ? ` AND geometry_thickness = ${queryRequest['geometry_thickness']}` : '';
    let lengthSearch = queryRequest['geometry_length'] ? ` AND geometry_length = ${queryRequest['geometry_length']}` : '';
    let diameterSearch = queryRequest['geometry_diameter'] ? ` AND geometry_diameter = ${queryRequest['geometry_diameter']}` : '';
    let materialSearch = queryRequest['material'] ? ` AND material = ${queryRequest['material']}` : '';
    let typeSearch = queryRequest['contraption_type'] ? ` AND type IN (${queryRequest['contraption_type']})` : '';
    let machineSearch = queryRequest['machine'] ? ` AND machine IN (${queryRequest['machine']})` : '';
    let idCodeSearch = queryRequest['id-code'] ? ` AND contraption.id_code LIKE '%${queryRequest["id-code"]}%'`: '';
    let orderStatusSearch = queryRequest['order_status'] ? ` AND order_status = ${queryRequest['order_status']}` : '';
    let removeZeroId = ' AND contraption_id!=0 '


    let whereClause = ' WHERE is_deleted = FALSE ';

    sqlQuery = `SELECT contraption_id, denomination, id_code, available_qt, minimum_qt, order_status,
    geometry_diameter,geometry_radius,geometry_length, geometry_degree, geometry_thickness,
    machine, type, work_material, purchase_request
    FROM contraption
    ${whereClause}
    ${materialSearch}
    ${orderStatusSearch}
    ${typeSearch}
    ${machineSearch}
    ${radiusSearch}
    ${degreeSearch}
    ${thicknessSearch}
    ${lengthSearch}
    ${diameterSearch}
    ${idCodeSearch}
    ${removeZeroId}
    ;`;

  }


  req.magazutDb.any(sqlQuery, [true])
    .then(function(dbRes) {
      console.log('funzia')
      console.log(sqlQuery);
      data.data = data.data.concat(parseContraption(dbRes));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});

module.exports = router;
