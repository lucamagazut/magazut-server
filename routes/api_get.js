var express = require('express');
var router = express.Router();

var parseOperator = function(data){
  let newData = {data:[]};
  data.forEach(element => {
    newData.data.push({
      id: element.employee_id,
      type:"operator",
      attributes:{
        first_name: element.name,
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

var parseContraption = function(data, pagination){
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
        purchaseRequest: element.purchase_request || '',
        order_status: element.order_status,
        availableQt: element.available_qt,
        minQt: element.minimum_qt,
        borrowed_qt: element.borrowed_qt,
        total_contraptions_found: element.total_contraptions_found || 1,
        pagination:pagination || 0,
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

var parseUnloadingHistory = function(data){
  let newData = [];
  data.forEach((element,index) => {
    delete element.result_qt;
    newData.push({
      id: index,
      type:"unloading-history",
      attributes:element
    });
  });
  return newData;
};

var parseContraptionHistory = function(data){
  let newData = [];
  data.forEach((element,index) => {
    delete element.result_qt;
    newData.push({
      id: index,
      type:"contraption-history",
      attributes:element
    });
  });
  return newData;
};


var parseMonthlyHistory = function(data){
  let newData = [];
  let filteredData = {};

  if(data.length === 0){
    newData.push({
      id: 0,
      type:"monthly-history",
      attributes:{
        quantity:0
      }
    })
    return newData;
  }

  data.forEach((element,index) => {
    if(!filteredData[element.contraption_id]){
      filteredData[element.contraption_id] = {
        quantity:0,
        contraption_denomination: element.contraption_denomination,
        contraption_id: element.contraption_id,
        contraption_id_code: element.contraption_id_code,
      };
    }
    filteredData[element.contraption_id].quantity += element.quantity;
    filteredData[element.contraption_id].transaction_time = element.transaction_time;
  });

  for (const [key, value] of Object.entries(filteredData)) {
    newData.push({
      id: key,
      type:"monthly-history",
      attributes:value
    });
  }
  return newData;
};

var parseEmployeeHistory = function(data){
  let newData = [];
  data.forEach((element,index) => {
    delete element.result_qt;
    newData.push({
      id: index,
      type:"employee-history",
      attributes:element
    });
  });
  return newData;
};

var parseYearHistory = function(data){
  let newData = [];
  let filteredData = {};

  data.forEach((element,index) => {
    if(!filteredData[element.contraption_id]){
      filteredData[element.contraption_id] = {
        quantity:0,
        contraption_denomination: element.contraption_denomination,
        contraption_id_code: element.contraption_id_code,
        contraption_id:element.contraption_id
      };
    }
    filteredData[element.contraption_id].quantity += element.quantity;
    filteredData[element.contraption_id].transaction_time = element.transaction_time;
  });

  for (const [key, value] of Object.entries(filteredData)) {
    newData.push({
      id: key,
      real_id:key,
      type:"year-history",
      attributes:value
    });
  }
  return newData;
};

var getQueryLike = function(queryRequestText){
  let words = queryRequestText.split(',');
  let queryLike = '';
  words.forEach((item, i) => {
    if(i === 0)
    {
      queryLike +=  `AND (LOWER(contraption.denomination) LIKE '%${item}%'`;
    }
    else{
      queryLike +=  ` OR LOWER(contraption.denomination) LIKE '%${item}%'`;
    }
    queryLike +=  `  OR LOWER(contraption.id_code) LIKE '%${item}%'`;
  });
  queryLike+= ')';
  console.log(`queryLike ${queryLike}`);
  return queryLike;
};

router.get('/operators', function(req, res, next) {
  req.magazutDb.any('SELECT * FROM employee WHERE employee_id!=0 ORDER BY second_name ASC', [true])
      .then(function(data) {
          res.send(parseOperator(data));
      })
      .catch(function(error) {
          res.send('non funzia');
      });
});

router.get('/categories', function(req, res, next) {
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
  let itemForPage = queryRequest.items || 25;
  let currentPage = queryRequest.page || 0;
  let offset =  itemForPage * currentPage;

  if(queryRequest.c_id){
    sqlQuery = `SELECT * FROM contraption WHERE contraption_id=${queryRequest.c_id}`;
  }
  else if(queryRequest['id-code']){
    sqlQuery = `SELECT * FROM contraption
      WHERE LOWER(contraption.id_code) LIKE LOWER('%${queryRequest["id-code"]}%')
      AND is_deleted = FALSE
      ORDER BY geometry_diameter ASC
      LIMIT ${itemForPage}
      OFFSET ${offset}
    `;
  }
  else if(queryRequest.filter){
    if(queryRequest.filter == 'runout'){
      sqlQuery = `SELECT *, count(*) OVER() AS total_contraptions_found
        FROM contraption
        WHERE (order_status = 0 OR order_status = 2)
        AND minimum_qt>0
        AND is_deleted = FALSE
        ORDER BY
          order_status ASC,
          type ASC,
          geometry_diameter ASC
        LIMIT ${itemForPage}
        OFFSET ${offset}
        `;
    }
  }else{
    let radiusSearch = queryRequest['geometry_radius'] ? ` AND geometry_radius = ${queryRequest['geometry_radius']}` : '';
    let degreeSearch = queryRequest['geometry_degree'] ? ` AND geometry_degree = ${queryRequest['geometry_degree']}` : '';
    let thicknessSearch = queryRequest['geometry_thickness'] ? ` AND geometry_thickness = ${queryRequest['geometry_thickness']}` : '';
    let lengthSearch = queryRequest['geometry_length'] ? ` AND geometry_length = ${queryRequest['geometry_length']}` : '';
    let diameterSearch = queryRequest['geometry_diameter'] ? ` AND geometry_diameter >= ${queryRequest['geometry_diameter']}` : '';
    let materialSearch = queryRequest['material'] ? ` AND material = ${queryRequest['material']}` : '';
    let typeSearch = queryRequest['contraption_type'] ? ` AND type IN (${queryRequest['contraption_type']})` : '';
    let machineSearch = queryRequest['machine'] ? ` AND machine IN (${queryRequest['machine']})` : '';
    let textSearch = queryRequest['text'] ? getQueryLike(queryRequest['text']): '';
    let orderStatusSearch = queryRequest['order_status'] ? ` AND order_status = ${queryRequest['order_status']}` : '';

    let whereClause = ' WHERE is_deleted = FALSE ';

    sqlQuery = `SELECT contraption_id, denomination, id_code, available_qt, borrowed_qt, minimum_qt, order_status,
    geometry_diameter,geometry_radius,geometry_length, geometry_degree, geometry_thickness,
    machine, type, work_material, purchase_request, count(*) OVER() AS total_contraptions_found
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
    ${textSearch}
    ORDER BY geometry_diameter ASC
    LIMIT ${itemForPage}
    OFFSET ${offset}
    ;`;

  }


  req.magazutDb.any(sqlQuery, [true])
    .then(function(dbRes) {
      console.log('funzia')
      console.log(sqlQuery);
      data.data = data.data.concat(parseContraption(dbRes,currentPage));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});

var addPagination = function(data, result_qt, limit, pageQuery, current_result_qt){
  result_qt = result_qt ? Number(result_qt) : 0;
  limit = Number(limit);

  data.push({
    id:0,
    type:"pagination",
    attributes:{
      current_page:Number(pageQuery),
      total_pages: result_qt > 0 ? Math.ceil(result_qt / limit) : 0,
      items_for_page:limit,
      items_showed: current_result_qt || limit,
      total_items:result_qt
    }
  });
};

router.get('/unloading-histories', function(req, res, next) {
  const queryRequest = req.query;
  let data = {data:[]};
  let pageQuery = (function(){
    let temp = queryRequest.page ? Number(queryRequest.page) : 1;
    if(temp < 1){
      return 1;
    }else{return temp}
  }());
  let limit = queryRequest.items_for_page ? Number(queryRequest.items_for_page) : 15;
  var offset = (pageQuery - 1) * limit;
  var sqlQuery = `SELECT
    transaction_time, involved_quantity, history.contraption_id,
    http_app_location, http_api_location, log, employee.name AS employee_name,
    user_id,
    employee.second_name AS employee_second_name,
    contraption.denomination AS contraption_denomination,
    contraption.id_code AS contraption_id_code,
    count(*) OVER() AS result_qt

    FROM history LEFT JOIN employee ON (user_id = employee_id) LEFT JOIN contraption ON (history.contraption_id = contraption.contraption_id)

    WHERE transaction_id=2
    ORDER BY history_event_id DESC
    LIMIT $2
    OFFSET $1`;

    console.log(sqlQuery);

  req.magazutDb.any(sqlQuery, [offset, limit])
    .then(function(dbRes) {
      addPagination(data.data, dbRes[0].result_qt, limit, pageQuery, dbRes.length);
      data.data = data.data.concat(parseUnloadingHistory(dbRes));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});


router.get('/monthly-histories', function(req, res, next) {
  const queryRequest = req.query;
  let data = {data:[]};
  let pageQuery = (function(){
    let temp = queryRequest.page ? Number(queryRequest.page) : 1;
    if(temp < 1){
      return 1;
    }else{return temp}
  }());
  var sqlQuery = `SELECT
    involved_quantity AS quantity, history.contraption_id,
    contraption.denomination AS contraption_denomination,
    contraption.id_code AS contraption_id_code,
    transaction_time,
    count(*) OVER() AS result_qt

    FROM history LEFT JOIN contraption ON (history.contraption_id = contraption.contraption_id)

    WHERE transaction_id=2
	  AND transaction_time < $1 AND transaction_time >= $2`;

    console.log(sqlQuery);

  let currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - (pageQuery-1));
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth() + 1;

  currentDate.setMonth(currentDate.getMonth() +1);
  let nextYear = currentDate.getFullYear();
  let nextMonth = currentDate.getMonth() + 1;

  let currentDateString = `${currentYear}-${currentMonth}-01`;
  let nextDateString = `${nextYear}-${nextMonth}-01`;


  req.magazutDb.any(sqlQuery, [nextDateString, currentDateString])
    .then(function(dbRes) {
      data.data = data.data.concat(parseMonthlyHistory(dbRes));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});


router.get('/year-histories', function(req, res, next) {
  const queryRequest = req.query;
  let data = {data:[]};
  let pageQuery = (function(){
    let temp = queryRequest.page ? Number(queryRequest.page) : 1;
    if(temp < 1){
      return 1;
    }else{return temp}
  }());
  var sqlQuery = `SELECT
    involved_quantity AS quantity, history.contraption_id,
    contraption.denomination AS contraption_denomination,
    contraption.id_code AS contraption_id_code,
    transaction_time,
    count(*) OVER() AS result_qt

    FROM history LEFT JOIN contraption ON (history.contraption_id = contraption.contraption_id)

    WHERE transaction_id=2
	  AND transaction_time < $1 AND transaction_time >= $2`;

    console.log(sqlQuery);

  let currentDate = new Date();
  // currentDate.setFullYear(currentDate.getFullYear() - pageQuery);
  let currentYear = currentDate.getFullYear() - (pageQuery - 1);
  let nextYear = currentYear + 1;

  let currentDateString = `${currentYear}-01-01`;
  let nextDateString = `${nextYear}-01-01`;

  req.magazutDb.any(sqlQuery, [nextDateString, currentDateString])
    .then(function(dbRes) {
      data.data = data.data.concat(parseYearHistory(dbRes));
      res.send(data);
    })
    .catch(function(error) {
        res.send(sqlQuery);
    });
});



router.get('/contraption-histories', function(req, res, next) {
  const queryRequest = req.query;
  const contraption_id = queryRequest.contraption_id;
  let data = {data:[]};
  let pageQuery = (function(){
    let temp = queryRequest.page ? Number(queryRequest.page) : 1;
    if(temp < 1){
      return 1;
    }else{return temp}
  }());
  let limit = queryRequest.items_for_page ? Number(queryRequest.items_for_page) : 25;
  var offset = (pageQuery - 1) * limit;
  var sqlQuery = `SELECT
    transaction_time, involved_quantity, history.contraption_id,
    employee.employee_id AS employee_id,
    employee.name AS employee_name,
    employee.second_name AS employee_second_name,
    contraption.denomination AS contraption_denomination,
    contraption.id_code AS contraption_id_code,
    contraption.contraption_id AS contraption_id,
    transaction_id,
    count(*) OVER() AS result_qt

    FROM history LEFT JOIN employee ON (user_id = employee_id) LEFT JOIN contraption ON (history.contraption_id = contraption.contraption_id)

    WHERE history.contraption_id=$3 AND transaction_id!=0
    ORDER BY history_event_id DESC
    LIMIT $2
    OFFSET $1`;

    console.log(sqlQuery);

  req.magazutDb.any(sqlQuery, [offset, limit, contraption_id])
    .then(function(dbRes) {
      addPagination(data.data, dbRes[0].result_qt, limit, pageQuery, dbRes.length);
      data.data = data.data.concat(parseContraptionHistory(dbRes));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});



router.get('/employee-histories', function(req, res, next) {
  const queryRequest = req.query;
  let data = {data:[]};
  const employee_id = queryRequest.employee_id;
  let pageQuery = (function(){
    let temp = queryRequest.page ? Number(queryRequest.page) : 1;
    if(temp < 1){
      return 1;
    }else{return temp}
  }());

  let limit = queryRequest.items_for_page ? Number(queryRequest.items_for_page) : 25;
  var offset = (pageQuery - 1) * limit;
  var sqlQuery = `SELECT
    involved_quantity AS quantity, history.contraption_id,
    contraption.denomination AS contraption_denomination,
    contraption.id_code AS contraption_id_code,
    contraption.contraption_id,
    transaction_time,
    employee.name AS employee_name, employee.second_name AS employee_second_name, employee.employee_id AS employee_id,
    count(*) OVER() AS result_qt

    FROM history LEFT JOIN employee ON (user_id = employee_id) LEFT JOIN contraption ON (history.contraption_id = contraption.contraption_id)

    WHERE history.user_id=$3 AND transaction_id=2

    ORDER BY transaction_time DESC
    LIMIT $2
    OFFSET $1
    `;

    console.log(sqlQuery);

  req.magazutDb.any(sqlQuery,  [offset, limit, employee_id])
    .then(function(dbRes) {
      addPagination(data.data, dbRes[0].result_qt, limit, pageQuery, dbRes.length, dbRes.length);
      data.data = data.data.concat(parseEmployeeHistory(dbRes));
      res.send(data);
    })
    .catch(function(error) {
      console.log('non funzia');
      console.log(error);
        res.send(sqlQuery);
    });
});


module.exports = router;
