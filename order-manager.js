
var app = {};


app.getNewState = function(availableQt, minQt, currentOrderStatus, addingQt){
  let newQt = availableQt + addingQt;
  let isCharging = addingQt > 0;

  currentOrderStatus = Number(currentOrderStatus);
  minQt = Number(minQt);
  addingQt = Number(addingQt);
  availableQt = Number(availableQt);
  // 
  // console.log('currentOrderStatus '+ currentOrderStatus);
  // console.log('availableQt '+ availableQt);
  // console.log('minQt '+ minQt);
  // console.log('addingQt '+ addingQt);

  if((currentOrderStatus === 3 || currentOrderStatus === 4) && !isCharging){
    console.log('getNewState 1');
    // se arrivato o ordinato e scarico, lo stato rimane su ordinato o arrivato
    return currentOrderStatus; //arrivato o ordinato
  }
  else if(newQt > minQt){
    console.log('getNewState 2');
    // se la quantita nuova is more then minima, disponibile
    return 1; //disponibile
  }
  else if(newQt > 0){
    console.log('getNewState 3');

    // se maggiore zero ma comunque meno di minima, in esaurimento
    return 2; //in esaurimento
  }
  else{
    console.log('getNewState 4');

    return 0; //esaurito
  }
};

app.validate = function(qtToAdd, currentQt){
  return currentQt + qtToAdd > 0;
};

module.exports = app;
