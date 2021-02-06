var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const pgp = require('pg-promise')();
var config = require('./config.js');
var nodeMailer = require('nodemailer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const apiRouterGet = require('./routes/api_get');
const apiRouterPut = require('./routes/api_put');
const apiRouterBorrow = require('./routes/api_borrow');
const apiRouterPost = require('./routes/api_post');
const apiRouterPatch = require('./routes/api_patch');
const apiRouterDelete = require('./routes/api_delete');
const bodyParser = require('body-parser');
const apiAllowIp = require('./routes/api_allow_ip');
const checkAllowedIpRouter = require('./routes/api_check_ip');





var app = express();
app.disable('etag');

const cn = config.db_credential;

const db = pgp(cn);
var dbMiddle = function (req, res, next) {
  req.magazutDb = db;
  next();
};

var allowed_ip_list = [];
let ipListMiddle = function (req, res, next) {
  req.allowed_ip_list = allowed_ip_list;
  next();
};

;(function(){
  console.log(path.join(__dirname,'init.sql') );
  var filePath = path.join(__dirname,'init.sql');

  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (!err) {
          console.log('received data: ' + data);
        db.none(data, true)
          .then(function() {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(err)
                return;
              }
            })
          })
          .catch(function(error) {
            // no need error
          });
      } else {
        // no need error
      }
  });
}());


var mailMiddle = function(req, res, next){
  let transporter = nodeMailer.createTransport(config.email_credential.transporter_obj);

  var createMessage = function(id_code, denomination, available_qt, purchase_request){
    let message = `
      Il prodotto "${denomination}" id-code "${id_code}" è esaurito o sta per esaurirsi.
      La quantità attuale è ${available_qt}.
      Si prega di ordinare.


      ------------------------------------------------
      Email generata automaticamente dalla app per la gestione del magazzino utensili.
      Non rispondere, questa casella email non è monitorata. Per ogni comunicazione scrivere a ${config.email_credential.reference}
    `;
    return message;
  };

  var createEmptyMagMessage = function(id_code, denomination, available_qt, borrowed_qt){
    let diff = Number(available_qt) - Number(borrowed_qt);
    let message = `
      Prodotto "${denomination}" id-code "${id_code}"

      La quantità prestata o da affilare è superiore a quella minima.
      Nel magazzino sono ancora disponibili ${diff}, mentre quelli prestati/da affilare sono ${borrowed_qt}.


      ------------------------------------------------
      Email generata automaticamente dalla app per la gestione del magazzino utensili.
      Non rispondere, questa casella email non è monitorata. Per ogni comunicazione scrivere a ${config.email_credential.reference}
    `;
    return message;
  };

  var mailOptions = {
      to: config.email_credential.mailOptions.to,
      subject: config.email_credential.mailOptions.subject,
      text: ''
  };

  req.sendOrderMail = function(id_code, denomination, available_qt, purchase_request){
    console.log('dentro app.js sendOrderMail');
    mailOptions.text = createMessage(id_code, denomination, available_qt, purchase_request);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Mail di ordine mandata');
    });
  };

  req.sendMailEmptyMag = function(id_code, denomination, available_qt, borrowed_qt){
    console.log('dentro app.js sendMailEmptyMag');
    mailOptions.text = createEmptyMagMessage(id_code, denomination, available_qt, borrowed_qt);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Mail empty mag mandata');
    });
  };

  let mailOptions2 = {};
  req.sendMail = function(to, subject, text){
    console.log('entra sendmail');
    console.log(`${to}, ${subject}, ${text}`);
    mailOptions2 = {
      to: to,
      subject: subject || 'test email',
      text: text || 'Prova email app magazzino ut cividino'
    };
    transporter.sendMail(mailOptions2, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Mail di ordine mandata');
    });

  };
  next();
};

//
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  // if(req.app.get('env') == 'development'){
  if(true){
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, HEAD, UPDATE, PATCH, OPTIONS");
  }
  next();
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({type:'application/vnd.api+json'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/',dbMiddle);
app.use('/',mailMiddle);
app.use('*',ipListMiddle);

app.use('/api/allow-ip',apiAllowIp);

app.use('/api',checkAllowedIpRouter);
app.use('/api',apiRouterGet);
app.use('/api',apiRouterBorrow);
app.use('/api',apiRouterPut);
app.use('/api',apiRouterPost);
app.use('/api',apiRouterPatch);
app.use('/api',apiRouterDelete);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if(err.errors){
    res.status(err.errors[0].status).send(err);
  }else{
    res.status(500).send({
      "errors": [
        {
          "status": "500",
          "source": {},
          "title":  "Errore 500",
          "detail": "Richiesta non processata."
        }
      ]
    })
  }
  // res.render('error');
});

module.exports = app;
