const express = require('express');
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');

dotenv.config();

require('./strategies/lissiConnectOidc')

var indexRoute = require('./routes/index');
var usersRoute = require('./routes/users');
var authRoute = require('./routes/auth');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded());

app.use(cookieParser());
app.use(
  session({
    secret: 'Lizard Wizard',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log(`${req.method}:${req.url}`);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRoute)
app.use('/user', usersRoute)
app.use('/auth', authRoute);

app.listen(process.env.PORT, () => console.log(`Server Running on port ${process.env.PORT}`))
