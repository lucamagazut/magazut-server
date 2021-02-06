var express = require('express');
var router = express.Router();
var orderManager = require('../services/order-manager');
var history = require('../services/history');
var errorManager = require('../services/errorManager');




router.post('/returning', function(req, res, next) {
  const requestPostParams = req.body;
  const borrowed_contraption_id = Number(requestPostParams.borrowed_contraption_id);
  const available_qt = Number(requestPostParams.available_qt);
  const borrowed_qt = Number(requestPostParams.borrowed_qt);
  const contraption_id = Number(requestPostParams.contraption_id);
  const employee_id = Number(requestPostParams.employee_id);
  const qt_to_return = Number(requestPostParams.qt_to_return);
  const returned_qt = Number(requestPostParams.returned_qt);

  //
  //
  // validazione qt
  // update se qt_to_return < returned_qt
  // delete altrimenti
  // update borrowed_qt da contraption


  if(qt_to_return < returned_qt){
    throw errorManager.getError("Richiesta non valida", "La quantità ritornata deve essere uguale o inferiore a quella prestata.", 403);
  }

  let updateBorrowQuery;
  if((qt_to_return - returned_qt) === 0 ){
    updateBorrowQuery = `
      DELETE FROM borrowed_contraption
      WHERE borrowed_contraption_id=$1
      ;
    `;
  }else{
    updateBorrowQuery = `
      UPDATE borrowed_contraption SET qt_to_return=qt_to_return - $2
      WHERE borrowed_contraption_id=$1
      RETURNING *
      ;
    `;
  }

  let borrowedContraption;

  req.magazutDb.task(t => {
    return t.oneOrNone(updateBorrowQuery, [borrowed_contraption_id, returned_qt])
      .then(item => {
        borrowedContraption = item;
        let updateContraptionQuery = `
          UPDATE contraption SET borrowed_qt=borrowed_qt - $2
          WHERE contraption_id = $1
          RETURNING *`;

        return t.one(updateContraptionQuery, [contraption_id, returned_qt]);

      })
    })
    .then(item2 => {

      let new_qt_to_return = borrowedContraption ? borrowedContraption.qt_to_return : 0;

      let newData = {
        data:
          {
            type:'borrowed-contraption',
            id: borrowed_contraption_id,
            attributes: {qt_to_return:new_qt_to_return}
          }
      };

      res.send(newData);
      history.addHistoryRecord({employee_id: employee_id, transaction_id:7, involved_quantity:returned_qt, contraption_id:contraption_id},req);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        history.addErrorRecord(req, contraption_id, '', error);
        res.send(error);
    });
});


router.post('/borrowing', function(req, res, next) {
  const requestPostParams = req.body;
  const available_qt = Number(requestPostParams.available_qt);
  const borrowed_qt = Number(requestPostParams.borrowed_qt);
  const contraption_id = Number(requestPostParams.contraption_id);
  const employee_id = Number(requestPostParams.employee_id);
  const qt_to_return = Number(requestPostParams.qt_to_return);

  if((available_qt - borrowed_qt) < qt_to_return){
    throw errorManager.getError("Richiesta non valida", "La quantità da prestare deve essere inferiore a quella disponibile in magazzino.", 403);
  }

  let searchBorrowedEntry = `SELECT * FROM borrowed_contraption WHERE (contraption_id=$1 AND employee_id=$2);`;

  let borrowedContraption;
  let contraption;
  let new_qt_to_return = 0;
  let totalQtToReturn = 0;
  req.magazutDb.task(t => {
    return t.oneOrNone(searchBorrowedEntry, [contraption_id, employee_id])
      .then(borrowEntry => {
        let setBorrowedQuery;
        let borrowed_contraption_id = 0;
        if(borrowEntry){
          new_qt_to_return = borrowEntry.qt_to_return + qt_to_return;
          borrowed_contraption_id = borrowEntry.borrowed_contraption_id;
          setBorrowedQuery = `UPDATE borrowed_contraption
            set qt_to_return=$2
            WHERE borrowed_contraption_id=$4
            RETURNING *;`;
        }else{
          new_qt_to_return = qt_to_return;
          setBorrowedQuery =`INSERT INTO borrowed_contraption (contraption_id, qt_to_return, employee_id)
            values ($1, $2, $3)
            RETURNING *
            ;`;
        }
        return t.one(setBorrowedQuery, [contraption_id, new_qt_to_return, employee_id, borrowed_contraption_id]);

      })
      .then((borrowedItem) => {
        borrowedContraption = borrowedItem;

        //aggiornare borrowed_qt controllando dal db

        let sumSql = `
          SELECT SUM (qt_to_return) AS total
          FROM borrowed_contraption
          WHERE contraption_id=$1`;
        return t.one(sumSql, [contraption_id]);
      })
      .then((total) => {

        let updateQuery = `UPDATE contraption SET borrowed_qt=$2
          WHERE contraption_id = $1 RETURNING *`;

        return t.one(updateQuery, [contraption_id, total.total]);
      });
    })
    .then(item => {

      let newData = {
        data:[
          {
            type:'contraption',
            id:contraption_id,
            attributes:item
          },
          {
            type:'borrowed_contraption',
            id: borrowedContraption.borrowed_contraption_id,
            attributes: borrowedContraption
          }
        ]
      };
      res.send(newData);

      if(orderManager.shouldSendMailEmptyMag(item.available_qt, item.minimum_qt, item.borrowed_qt)){
        req.sendMailEmptyMag(item.id_code, item.denomination, item.available_qt, item.borrowed_qt);
      }
      history.addHistoryRecord({employee_id: employee_id, transaction_id:6, involved_quantity:qt_to_return, contraption_id:contraption_id},req);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        history.addErrorRecord(req, contraption_id, '', error);
        res.send(error);
    });
});


router.post('/broken', function(req, res, next) {
  const requestPostParams = req.body;
  const borrowed_contraption_id = Number(requestPostParams.borrowed_contraption_id);
  const available_qt = Number(requestPostParams.available_qt);
  const borrowed_qt = Number(requestPostParams.borrowed_qt);
  const contraption_id = Number(requestPostParams.contraption_id);
  const employee_id = Number(requestPostParams.employee_id);
  const qt_to_return = Number(requestPostParams.qt_to_return);
  const broken_qt = Number(requestPostParams.broken_qt);

  /*
  verificare qt_to_return maggiore o uguale a broken
  se broke all, allora DELETE
  altrimenti update
  poi modificare il contraption, sia borrowed che available_qt
  ritornare solo il borrowed



  */

  if(qt_to_return < broken_qt){
    throw errorManager.getError("Richiesta non valida", "La quantità rotta deve essere uguale o inferiore a quella prestata.", 403);
  }

  let updateBorrowQuery;
  if((qt_to_return - broken_qt) === 0 ){
    updateBorrowQuery = `
      DELETE FROM borrowed_contraption
      WHERE borrowed_contraption_id=$1
      ;
    `;
  }else{
    updateBorrowQuery = `
      UPDATE borrowed_contraption SET qt_to_return=qt_to_return - $2
      WHERE borrowed_contraption_id=$1
      RETURNING *
      ;
    `;
  }

  let borrowedContraption;

  req.magazutDb.task(t => {
    return t.oneOrNone(updateBorrowQuery, [borrowed_contraption_id, broken_qt])
      .then(item => {
        borrowedContraption = item;
        let updateContraptionQuery = `
          UPDATE contraption SET borrowed_qt=borrowed_qt - $2, available_qt=available_qt - $2
          WHERE contraption_id = $1
          `;

        return t.none(updateContraptionQuery, [contraption_id, broken_qt]);

      })
    })
    .then(() => {

      let new_qt_to_return = borrowedContraption ? borrowedContraption.qt_to_return : 0;

      let newData = {
        data:
          {
            type:'borrowed-contraption',
            id: borrowed_contraption_id,
            attributes: {qt_to_return:new_qt_to_return}
          }
      };

      res.send(newData);
      history.addHistoryRecord({employee_id: employee_id, transaction_id:9, involved_quantity:broken_qt, contraption_id:contraption_id},req);
    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        history.addErrorRecord(req, contraption_id, '', error);
        res.send(error);
    });
});



router.post('/change_borrowed_employee', function(req, res, next) {
  const requestPostParams = req.body;
  const available_qt = Number(requestPostParams.available_qt);
  const borrowed_contraption_id = Number(requestPostParams.borrowed_contraption_id);
  const borrowed_qt = Number(requestPostParams.borrowed_qt);
  const contraption_id = Number(requestPostParams.contraption_id);
  const employee_id = Number(requestPostParams.employee_id);
  const change_employee_id = Number(requestPostParams.change_employee_id);
  const change_borrowed_qt = Number(requestPostParams.change_borrowed_qt);
  const qt_to_return = Number(requestPostParams.qt_to_return);


  if(change_borrowed_qt <= 0){
    throw errorManager.getError("Richiesta non valida", "La quantità da traferire deve essere superiore a zero.", 403);
  }

  if(change_borrowed_qt > qt_to_return){
    throw errorManager.getError("Richiesta non valida", "La quantità da traferire deve essere inferiore o uguale a quella prestata.", 403);
  }

  if(employee_id === change_employee_id){
    throw errorManager.getError("Richiesta non valida", "L'utente a cui traferire l'articolo deve essere diverso dal mittente", 403);
  }

  /*
  update o cancellare borrowed entry
  creare o aggiornare affilatura borrowed entry
  nessun cambiamento a livello di contraption


  */
  let new_qt_to_return = qt_to_return - change_borrowed_qt;
  if(new_qt_to_return !== 0){
    setBorrowedQuery = `UPDATE borrowed_contraption
      set qt_to_return=$2
      WHERE borrowed_contraption_id=$1
      ;`;
  }else{
    setBorrowedQuery =`
      DELETE FROM borrowed_contraption
      WHERE borrowed_contraption_id=$1
      ;`;
  }

  setBorrowedQuery+=`
    SELECT * FROM borrowed_contraption WHERE (contraption_id=$3 AND employee_id=$4);
  `;
  let borrowedContraption;
  let contraption;
  req.magazutDb.task(t => {
    return t.oneOrNone(setBorrowedQuery, [borrowed_contraption_id, new_qt_to_return, contraption_id, change_employee_id])
      .then(changeBorrowEntry => {

        let changeBorrowEntry_qt_to_return;
        let setBorrowedQuery;
        let changeBorrowEntry_borrowed_contraption_id;
        if(changeBorrowEntry){
          changeBorrowEntry_qt_to_return = changeBorrowEntry.qt_to_return + change_borrowed_qt;
          changeBorrowEntry_borrowed_contraption_id = changeBorrowEntry.borrowed_contraption_id;
          setBorrowedQuery = `UPDATE borrowed_contraption
            set qt_to_return=$2
            WHERE borrowed_contraption_id=$4
            RETURNING *;`;
        }else{
          changeBorrowEntry_qt_to_return = change_borrowed_qt;
          setBorrowedQuery =`INSERT INTO borrowed_contraption (contraption_id, qt_to_return, employee_id)
            values ($1, $2, $3)
            RETURNING *
            ;`;
        }

        return t.one(setBorrowedQuery, [contraption_id, changeBorrowEntry_qt_to_return, change_employee_id, changeBorrowEntry_borrowed_contraption_id]);

      })


    })
    .then(item => {

      let newData = {
        data:
          {
            type:'borrowed_contraption',
            id: borrowed_contraption_id,
            attributes: {qt_to_return:new_qt_to_return}
          }
      };
      res.send(newData);

      history.addHistoryRecord({employee_id: employee_id, transaction_id:7, involved_quantity:change_borrowed_qt, contraption_id:contraption_id},req);
      history.addHistoryRecord({employee_id: change_employee_id, transaction_id:6, involved_quantity:change_borrowed_qt, contraption_id:contraption_id},req);

    })
    .catch(error => {
      console.log('errore');
      console.log(error);
        history.addErrorRecord(req, contraption_id, '', error);
        res.send(error);
    });
});

module.exports = router;
