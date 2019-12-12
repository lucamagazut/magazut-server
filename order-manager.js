
var app = {};


app.getNewState = function(availableQt, minQt, currentOrderStatus, addingQt){
  let newQt = availableQt + addingQt;
  let isCharging = addingQt >= 0;

  if((currentOrderStatus === 3 || currentOrderStatus === 4) && !isCharging){
    // se arrivato o ordinato e scarico, lo stato rimane su ordinato o arrivato
    return currentOrderStatus; //arrivato o ordinato
  }
  else if(newQt > minQt){
    // se la quantita nuova is more then minima, disponibile
    return 1; //disponibile
  }
  else if(newQt > 0){
    // se maggiore zero ma comunque meno di minima, in esaurimento
    return 2; //in esaurimento
  }
  else{
    return 0; //esaurito
  }
};

app.validate = function(qtToAdd, currentQt){
  return currentQt + qtToAdd > 0;
};

module.exports = app;
