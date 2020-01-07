var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const pgp = require('pg-promise')();
var config = require('./config.js');
var nodeMailer = require('nodemailer');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const apiRouterGet = require('./routes/api_get');
const apiRouterPut = require('./routes/api_put');
const apiRouterPost = require('./routes/api_post');
const apiRouterPatch = require('./routes/api_patch');
const apiRouterDelete = require('./routes/api_delete');



var app = express();

const cn = config.db_credential;

const db = pgp(cn);
var dbMiddle = function (req, res, next) {
  req.magazutDb = db;
  next();
};

var mailMiddle = function(req, res, next){
  let transporter = nodeMailer.createTransport(config.email_credential.transporter_obj);

  var createMessage = function(id_code, denomination, available_qt, purchase_request){
    let message = `
      Il prodotto [${denomination}] id-code=[${id_code}] è esaurito o sta per esaurirsi.
      La quantità attuale è [${available_qt}].
      Si prega di ordinare [${purchase_request}].


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
    mailOptions.text = createMessage(id_code, denomination, available_qt, purchase_request);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Mail di ordine mandata');
    });
  };
  next();
};

app.use(function(req, res, next) {
  if(req.app.get('env') == 'development'){
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, HEAD, UPDATE, PATCH");
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
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api',apiRouterGet);
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
