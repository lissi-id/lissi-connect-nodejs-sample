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

Issuer.discover('https://auth.lissi.io/')
  .then(res => {
    var client = new res.Client({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uris: [ 'http://localhost:3000/auth/callback' ],
      post_logout_redirect_uris: [ 'http://localhost:3000/logout/callback' ],
      
    });

    const nonce = generators.nonce();

    console.log(client)
  
    app.use(
      expressSesssion({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      'oidc',
      new Strategy({ client }, (tokenSet, done) => {
        return done(null, tokenSet.claims());
      })
    );

    // handles serialization and deserialization of authenticated user
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(user, done) {
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

      //console.log(issuanceSession)
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.CLIENT_SECRET
      });
      var options = {
        url: 'https://auth.lissi.io/api/issuance-sessions',
        port: '80',
        method: 'POST',
        headers,
        json: issuanceSession

      }

      http.request(options, (res) => {console.log(res.data)})
      //passport.authenticate('oidc', { issuance_session_id: '8c7203ca-e034-4499-a80c-134904c714ff', scope : 'openid profile vc_authn', nonce } )(req, res, next);
    });

    app.get('/login', (req, res, next) =>{
      console.log('test')
    })

    // authentication callback
    app.get('/auth/callback', (req, res, next) => {
      passport.authenticate('oidc', {
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
