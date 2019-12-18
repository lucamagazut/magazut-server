var express = require('express');
var router = express.Router();
var history = require('../services/history');


router.delete('/contraptions/:id', function(req, res, next) {
  const contraptionId = Number(req.params.id);
  const sqlQuery = 'UPDATE contraption SET is_deleted=TRUE WHERE contraption_id=$1';
  req.magazutDb.none(sqlQuery, [contraptionId])
      .then(function() {
          history.addDeleteRecord(req, contraptionId);
          console.log('dopo addDeleteRecord');
          res.send({data:{type:'contraption',id:contraptionId}});
      })
      .catch(function(error) {
        history.addErrorRecord(req, 0, sqlQuery, error);
        console.log(error);;
        res.send(error);
      });
});


module.exports = router;
