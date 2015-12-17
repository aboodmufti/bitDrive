var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
//var multer = require('multer');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');

var routes = require('./routes/index');
var users = require('./routes/users');

db.serialize(function() {
    db.run("create table if not exists user(\
            user_id integer NOT NULL primary key,\
            first_name varchar(40),\
            last_name varchar(40),\
            email varchar(60),\
            password varchar(100))"
            );
            
    db.run("create table if not exists directory(\
            dir_id integer NOT NULL primary key,\
            dir_name varchar(100),\
            user_id integer,\
            parent_dir_id integer,\
            time varchar(30),\
            foreign key(user_id) references user(user_id) on delete cascade,\
            foreign key(parent_dir_id) references directory(dir_id) on delete cascade)"
            );

    db.run("create table if not exists file(\
            file_id integer NOT NULL primary key,\
            dir_id integer,\
            user_id integer,\
            file_name varchar(100),\
            file_path varchar(200),\
            time varchar(30),\
            size UNSIGNED BIG INT,\
            foreign key(user_id) references user(user_id) on delete cascade,\
            foreign key(dir_id) references directory(dir_id) on delete cascade)"
            );
    
    db.run("PRAGMA foreign_keys=ON");

});



db.close();



var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    secret: "bitbitDrive",
    store: new FileStore({
        ttl: 432000,
        }),
    resave: false,
    saveUninitialized: false,
    unset:'destroy'
  }));


app.use('/', routes);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
