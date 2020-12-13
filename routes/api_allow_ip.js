var express = require('express');
var router = express.Router();
var config = require('../config.js');

var errorManager = require('../services/errorManager');



router.get('/', function(req, res, next) {
  // req.allowed_ip_list
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const queryPassword = req.query.password;

  if(config.allow_ip_password != queryPassword){
    throw errorManager.getError("Richiesta non valida", "Password Errata", 403);
  }

  let sqlQuery = `
    INSERT INTO allowed_ip (allowed_ip_value) values ($1);
  `;
  req.allowed_ip_list.push(ip);
  req.magazutDb.none(sqlQuery, [ip])
    .then(function(data) {
        res.send({
          data:{
            response:'ok'
          }
        });
    })
    .catch(function(error) {
      res.send(error);
    });
});


module.exports = router;
