
function getSqlQuery(){
  let sqlQuery = `
    INSERT INTO history
    (user_id, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log)
    VALUES ($1,$2,$3,$4,$5,$6,$7);
  `;
  return sqlQuery;
}

function getQueryArray(queryObj){

}

var app = {
  addChargingRecord(req){
    const queryRequest = req.query;

    const operator = queryRequest.op || 0;
    const transaction_id = 1;
    const contraption_id = queryRequest.id;
    const involved_quantity = queryRequest.qt;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": 'Aggiunta quantita'};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addChargingRecord OK');
      })
      .catch(function(error) {
          console.log('addChargingRecord FAIL');
          console.log(error);
      });

  },
  addUnchargingRecord(req){
    const queryRequest = req.query;

    const operator = queryRequest.op || 0;
    const transaction_id = 2;
    const contraption_id = queryRequest.id;
    const involved_quantity = queryRequest.qt;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": 'Rimossa quantita'};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addUnchargingRecord OK');
      })
      .catch(function(error) {
          console.log('addUnchargingRecord FAIL');
          console.log(error);
      });
  },
  addErrorRecord(req, contraption_id, sqlQuery, error){
    const queryRequest = req.query;
    const dataRequest = req.body.data;

    const operator = 0;
    const transaction_id = 0;
    const involved_quantity = 0;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": "errore", "error":error, "sql_query":sqlQuery};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addErrorRecord OK');
      })
      .catch(function(error) {
          console.log('addErrorRecord FAIL');
          console.log(error);
      });
  },
  addCreatingRecord(req, contraption_id){
    const operator = 0;
    const transaction_id = 3;
    const involved_quantity = 1;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": 'Creazione aggeggio'};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addCreatingRecord OK');
      })
      .catch(function(error) {
          console.log('addCreatingRecord FAIL');
          console.log(error);
      });

  },
  addModifyRecord(req, contraption_id, modifySqlVars){
    const operator = 0;
    const transaction_id = 4;
    const involved_quantity = 0;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": 'Modifica aggeggio', "sqlVars": modifySqlVars};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addModifyRecord OK');
      })
      .catch(function(error) {
          console.log('addModifyRecord FAIL');
          console.log(error);
      });

  },
  addDeleteRecord(req, contraption_id){
    const operator = 0;
    const transaction_id = 5;
    const involved_quantity = 0;
    const http_app_location = {"url":req.header('Referer')};
    const http_api_location = {"protocol": req.protocol, "host":req.get('host'), "originalUrl":req.originalUrl};
    const log = {"description": 'Cancellazione aggeggio'};

    let sqlVars = [operator, transaction_id, contraption_id, involved_quantity, http_app_location, http_api_location, log ];

    req.magazutDb.none(getSqlQuery(), sqlVars)
      .then(function() {
          console.log('addDeleteRecord OK');
      })
      .catch(function(error) {
          console.log('addDeleteRecord FAIL');
          console.log(error);
      });

  },

};

module.exports = app;
