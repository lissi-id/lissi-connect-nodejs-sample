var createError = require('http-errors');
var http = require('http')
const { uuid } = require('uuidv4');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSesssion = require('express-session');
const passport = require('passport');
var { Issuer, Strategy, generators } = require('openid-client');
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(
  expressSesssion({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

Issuer.discover('https://auth.lissi.io/')
  .then(lissiIssuer => {
    var client = new lissiIssuer.Client({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uris: [ 'http://localhost:3000/auth/callback' ],
      post_logout_redirect_uris: [ 'http://localhost:3000/logout/callback' ],
      
    });

    const nonce = generators.nonce();

    const strategy = new Strategy({ 
      client,
      usePKCE : false,
      sessionKey: 'passport',
      params:{
        scope : 'openid profile vc_authn',
        nonce,
        // redirect_uri: 'http://localhost:3000/auth/callback',
        // post_logout_redirect_uris: 'http://localhost:3000/logout/callback',
        // client_id:client.client_id,
        // client_secret:client.client_secret
      } }, (tokenSet, done) => {
        console.log(tokenSet.claims())
        return done(null, tokenSet.claims());
    });    
  
   

    passport.use(strategy);

    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(user, done) {
      console.log('des')
      done(null, user);
    });

    // start authentication request
    app.get('/auth', (req, res, next) => {
      userId = uuid()
    
      const issuanceSession = {
        subjectIdentifier : userId,
        claims:{
          'First Name': req.query.firstName,
          "Last Name": req.query.lastName,
          "E-Mail": req.query.email,
          "User ID": userId
        },
        credentialDefinitionId: process.env.CREDENTIAL_DEFINITION_ID
      }
    
      // Request Issuance session Id
      axios.post('https://auth.lissi.io/api/issuance-sessions', issuanceSession)
      .then(result => {
        console.log(result.status)
        res.redirect('/auth/'+result.data.id)
        
      })
      .catch(e =>{
        console.error(e)
      })
         
    }
    );

    app.get('/auth/:id', (req, res, next) =>{
      passport.authenticate(strategy, { issuance_session_id: req.params.id })(req, res, next)
    });

    app.get('/login', (req, res, next) =>{
      passport.authenticate(strategy, { presentation_configuration_id:process.env.CREDENTIAL_DEFINITION_ID })(req, res, next)
    })

    // authentication callback
    app.get('/auth/callback', (req, res, next) => {
      console.log(req.session)

      passport.authenticate(strategy,{
        successRedirect: '/users',
        failureRedirect: '/'
      })(req, res, next);
    });

    app.use('/users', usersRouter);

    // start logout request
    app.get('/logout', (req, res) => {
      res.redirect(client.endSessionUrl());
    });

    // logout callback
    app.get('/logout/callback', (req, res) => {
      // clears the persisted user from the local storage
      req.logout();
      // redirects the user to a public route
      res.redirect('/');
    });


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
  });


module.exports = app;

