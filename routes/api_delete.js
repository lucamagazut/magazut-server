var express = require('express');
var router = express.Router();


router.delete('/contraptions/:id', function(req, res, next) {
  const contraptionId = Number(req.params.id);
  req.magazutDb.none('DELETE FROM contraption WHERE contraption_id=$1', [contraptionId])
      .then(function() {
          res.send({data:{type:'contraption',id:contraptionId}});
      })
      .catch(function(error) {
          res.send(error);
      });
});


module.exports = router;
