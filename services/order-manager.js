
var app = {};

/*
LEGENDA
0 - esaurito (qt == 0)
1 - disponibile
2 - in esaurimento (qt > 0 ma < di min)
3 - Ordinato (ordinato ai fornitori ma non ancora arrivato)
4 - arrivato (arrivato dai fornitori ma NON inserito nel db)
5 - dismesso (valore NON impostato da DB. Su db dismesso è min-qt=0. Il valore 5 arriva da una richiesta)
*/

app.shouldSendMail = function(order_status, minimum_qt){
  if(Number(minimum_qt) === 0){
    return false;
  }
  return order_status == 0 || order_status == 2;
};

app.isDismissing = function (orderStatus) {
  return Number(orderStatus) === 5;
};

app.validateChangingStatus = function(availableQt, minQt, newOrderStatus){

  minQt = Number(minQt);
  availableQt = Number(availableQt);
  newOrderStatus = Number(newOrderStatus);


  if(newOrderStatus === 3 || newOrderStatus === 4 || newOrderStatus === 5 ){
    return true;
  }
  else if(newOrderStatus === 0){
    if(availableQt > 0){
      return false;
    }else{
      return true;
    }
  }
  else if(newOrderStatus == 2){
    if(availableQt > 0){
      return true;
    }else{
      return false;
    }
  }
  else {
    // if(newOrderStatus == 1)
    if(availableQt > minQt){
      return true;
    }else{
      return false;
    }
  }
};

app.getNewState = function(newAvailableQt, minQt, currentBorrowedQt){
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
  else if(totalQt < minQt){
    console.log('ritorna 2');
    return 2;
  }
  else{
    console.log('ritorna else 1');
    return 1;
  }
};


app.getStateInCharging = function(contraption, qt_to_add){
  let available_qt = Number(contraption.available_qt) + qt_to_add;
  let minimum_qt = Number(contraption.minimum_qt);

  console.log('getStateInCharging');
  console.log(`available_qt ${available_qt}`);
  console.log(`minimum_qt ${minimum_qt}`);
  console.log(`qt_to_add ${qt_to_add}`);

  if(available_qt >= minimum_qt){
    return 1;
  }else if (available_qt < minimum_qt && available_qt > 0) {
    return 2;
  }else{
    return 0;
  }
};


app.getStateInDischarging = function(contraption, qt_to_remove){

  let available_qt = Number(contraption.available_qt) - qt_to_remove;
  let minimum_qt = Number(contraption.minimum_qt);
  let order_status = Number(contraption.order_status);

  if(order_status === 3 || order_status === 4){
    return order_status;
  }
  else if(available_qt >= minimum_qt){
    return 1;
  }else if (available_qt < minimum_qt && available_qt > 0) {
    return 2;
  }else{
    return 0;
  }
};

app.shouldSendMailInDischarging = function(order_status, minimum_qt){
  if(Number(minimum_qt) === 0){
    return false;
  }
  return order_status == 0 || order_status == 2;
};

app.shouldSendMailEmptyMag = function(available_qt, minimum_qt, borrowed_qt){
  available_qt = Number(available_qt);
  minimum_qt = Number(minimum_qt);
  borrowed_qt = Number(borrowed_qt);
  if(minimum_qt === 0){
    return false;
  }

  let inMagQt = available_qt - borrowed_qt;

  return inMagQt < minimum_qt;
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
