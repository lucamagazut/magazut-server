
var app = {};

/*
LEGENDA
0 - esaurito (qt == 0)
1 - disponibile
2 - in esaurimento (qt > 0 ma < di min)
3 - Ordinato (ordinato ai fornitori ma non ancora arrivato)
4 - arrivato (arrivato dai fornitori ma NON inserito nel db)
5 - !!! ELIMINATO, non necessario, minqt==0 significa dismesso !!! dismesso (non verrà più aggiornato lo stato o richiesto l'acquisto)
*/

app.shouldSendMail = function(order_status, minimum_qt){
  if(Number(minimum_qt) === 0){
    return false;
  }
  return order_status == 0 || order_status == 2;
};

app.changeNewStatus = function(availableQt, minQt, currentOrderStatus, newOrderStatus){

  currentOrderStatus = Number(currentOrderStatus);
  minQt = Number(minQt);
  availableQt = Number(availableQt);
  newOrderStatus = Number(newOrderStatus);

  if(newOrderStatus == 3 || newOrderStatus == 4 ){
    return newOrderStatus;
  }
  else if(newOrderStatus == 0){
    if(availableQt > 0){
      return 2;
    }else{
      return 0;
    }
  }
  else {
    // if(newOrderStatus == 1 || newOrderStatus == 2)
    if(availableQt > 0){
      return newOrderStatus;
    }else{
      return 0;
    }
  }
};

app.getNewState = function(currentOrderStatus, newAvailableQt, minQt, currentBorrowedQt){
  let totalQt = newAvailableQt + currentBorrowedQt;
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  console.log('totalQt '+totalQt);
  console.log('minQt '+minQt);
  console.log('newAvailableQt '+newAvailableQt);
  console.log('####################################################');
  if(totalQt == 0){
    console.log('ritorna zero');
    return 0;
  }
  else if(totalQt <= minQt){
    console.log('ritorna 2');
    return 2;
  }
  else{
    console.log('ritorna else 1');
    return 1;
  }
};

app.getNewStateAndQt = function(item, qtToAdd, isCharging, isBorrowed, isReturned){

  const currentAvailableQt = Number(item.available_qt);
  const currentBorrowedQt = Number(item.borrowed_qt);
  console.log('cacca');
  console.log(item.borrowed_qt);
  const minQt = Number(item.minimum_qt);
  const currentOrderStatus = Number(item.order_status);

  var returningObj = {
    available_qt: null,
    borrowed_qt: null,
    order_status: null
  }

  let newAvailableQt;
  if(isCharging){
    console.log('isCharging');
    newAvailableQt = currentAvailableQt + qtToAdd;
    returningObj.available_qt = newAvailableQt;
    if(isReturned){
      var merda = currentBorrowedQt === 0 || currentBorrowedQt < qtToAdd ? 0 : currentBorrowedQt - qtToAdd;
      returningObj.borrowed_qt = currentBorrowedQt === 0 || currentBorrowedQt < qtToAdd ? 0 : currentBorrowedQt - qtToAdd;
    }
    else{
      returningObj.borrowed_qt = currentBorrowedQt;
    }
    returningObj.order_status = app.getNewState(currentOrderStatus, newAvailableQt, minQt, currentBorrowedQt);
  }
  else{
    newAvailableQt = currentAvailableQt - qtToAdd;
    returningObj.available_qt = newAvailableQt;
    if(isBorrowed){
      returningObj.borrowed_qt = currentBorrowedQt + qtToAdd;
      returningObj.order_status = currentOrderStatus;
    }
    else{
      returningObj.borrowed_qt = currentBorrowedQt;
      returningObj.order_status = app.getNewState(currentOrderStatus, newAvailableQt, minQt, currentBorrowedQt);
    }
  }

  return returningObj;

};

app.validate = function(availableQt, qtToAdd, isCharging){
  if(isCharging){
    return true;
  }
  else{
    return availableQt >= qtToAdd;
  }
};

module.exports = app;
