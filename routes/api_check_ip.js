var express = require('express');
var router = express.Router();

var errorManager = require('../services/errorManager');


let parseAndSetAllowedIp = function(req, dbResp){
  let list = [];
  if(dbResp){
    dbResp.forEach((item, i) => {
      req.allowed_ip_list.push(item.allowed_ip_value);
    });
  }

  return list;
};

let notAllowedIpError = {
  "errors":
    [
      {
        "status": 401,
        "source": {},
        "title":  "Not Allowed",
        "detail": "Computer non autorizzato ad operare."
      }
  ]
};

let checkAllowedIp = function(req, res, next, ip){
  if(req.allowed_ip_list.indexOf(ip) !== -1){
    return next();
  }else{
    return res.status(notAllowedIpError.errors[0].status).send(notAllowedIpError);
  }
};

let checkAllowedIpMiddle = function (req, res, next) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`il mio ip: ${ip}`);

  let query = `SELECT * FROM allowed_ip`;
  if(req.allowed_ip_list.length === 0){
    console.log('fa la call al db select allowed_ip');
    req.magazutDb.any(query, [true]).then((items)=>{
      parseAndSetAllowedIp(req, items);
      return checkAllowedIp(req, res, next, ip);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        // history.addErrorRecord(req, contraption_id, '', error);
        res.send(error);
    });
  }else{
    console.log('usa in ram req.allowed_ip_list');
    return checkAllowedIp(req, res, next, ip, req);
  }
};


router.get('*', checkAllowedIpMiddle);




module.exports = router;
