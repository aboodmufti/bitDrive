var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var util = require('util');

sqlite3.verbose();
var db = new sqlite3.Database('mydb.db');

/* GET home page. */
router.get('/', function(req, res, next) {
    
    if (req.session.userid) {
      res.redirect("/home");
    } else {
      if(req.session.error){
        err = req.session.error;
        delete req.session.error;
        res.render('login', { title: 'bitDrive' ,msg: err});
      }else{
        res.render('login', { title: 'bitDrive' });
      }
    }

});


//login
router.post('/login', function(req, res) {
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    var five_days = 432000000;
    

    var checkName = function(err, result) {
        if (err) {
            console.log("login error: " + err)
            res.redirect("/");
        } 
        else{
            if (result){
              req.session.userid = result.user_id;
              req.session.email = email;
              req.session.Fname = result.first_name;
              req.session.cookie.maxAge = five_days;
              res.redirect("/home");
            }
            else{
              var stat = "Username and password don't match";
              req.session.error = stat;
              res.redirect("/");
              //res.render("login.jade", {title: 'bitDrive',  msg:stat});
            } 
        }
    }


    if(email){
        db.serialize(function() {
            db.get("select *\
                     from user\
                     where email = ? and password = ? ", email, password, checkName);
        });
    }
    else{
       var stat = "Please enter your email";
       res.render("login", {title: 'bitDrive',  msg:stat});
    }
});

//home
router.get('/home', function(req, res, next) {
    var directories = [];
    var files = [];
    var rootID;

    var getFiles = function(err, result){
      if(result){
        files = result;
      }
      
      console.log("driectories: " + util.inspect(directories, false, null));
      console.log("files: " + util.inspect(files, false, null));
      res.render("index", {title: 'bitDrive', files: files, dirs: directories, currDir : "root >"});
    }

    var getDirs = function(err, result){
      if(result){
        directories = result;
      }
      db.serialize(function() {
            db.all("select *\
                     from file\
                     where dir_id = ? ", rootID, getFiles);
      });

    }

    var getRoot = function(err, result){
      if(result){
        console.log("FOUND ROOT");
        rootID = result.dir_id;
        req.session.currDirID = rootID;
        req.session.currDirName = "root";
        db.serialize(function() {
              db.all("select *\
                       from directory\
                       where parent_dir_id = ? ", rootID, getDirs);
        });
      }else{
        console.log(err);

        //getDirs(undefined,undefined);
      }
    }

    if (req.session.userid) {
      //res.render("index", {title: 'bitDrive'});

      db.serialize(function() {
            db.get("select *\
                     from directory\
                     where user_id = ? and dir_name = ? ", req.session.userid, "root", getRoot);
      });

    } else {
      //res.render('login', { title: 'bitDrive' , msg:"Please login"});
      var stat = "Please login";
      req.session.error = stat;
      res.redirect("/");
    }

});

//newAccount
router.get('/newAccount', function(req, res, next) {

    if (req.session.userid) {
      res.redirect("/");
    } else {
      res.render('newAccount', { title: 'bitDrive' });
    }

});

//newAccount POST
router.post('/newAccount', function(req, res, next) {
    //console.log(req.body)
    var Fname = req.body.Fname;
    var Lname = req.body.Lname;
    var email = req.body.email.toLowerCase();
    var newPassword = req.body.password;

    var checkName = function(err, result) {
        if (err) {
            res.redirect("/");
        } else {
            if (result){
                var stat = "Email already used!";
                res.render("newAccount.jade", {title: "bitDrive",  msg:stat});
            }
            else{
                db.serialize(function() {
                    db.run('insert into user values (NULL,?,?,?,?)',Fname,Lname,email,newPassword, checkUpdate);
                });
            }
        }
    }

    var checkUpdate = function(err) {
        if (err) {
            console.log("checkUpdate error: "+ err);
            var stat = "There was an error creating the account!" ;
            res.render("newAccount.jade", { title:"bitDrive" , msg:"There was an error creating the account!",
                        status: err});
        } else {
            req.session.email = email;
            req.session.userid = this.lastID;
            req.session.Fname = Fname;
            
            var five_days = 432000000;
            req.session.cookie.maxAge = five_days;
            
            
            db.serialize(function() {
                    db.run('insert into directory values (NULL,?,?,NULL,?)',"root",req.session.userid,currTime());
            }); 

            res.redirect("/home");

        }
    }


    if(email == "" || email == " "){
            res.render("newAccount.jade", {title: "new Account", msg:"invalid username"});
    }else{
        db.serialize(function() {
            db.get("select *\
                     from user\
                     where email = ?;", email, checkName);
        });
    }

});


//uploadFile
router.post('/uploadFile', upload.single('uploaded') , function(req, res, next) {
    var uploaded = req.file;
    var currDirID = req.session.currDirID;
    //console.log(currDirID);
    var checkUpload =  function(err){
      if(err){
        console.log(err);
      }
        res.redirect("/");
    }

    if (req.session.userid) {
      console.log("uploaded file: "+util.inspect(uploaded, false, null))
      if(uploaded){
        db.serialize(function() {
          db.run('insert into file values (NULL,?,?,?,?,?)',currDirID,uploaded.originalname,uploaded.filename,currTime(), uploaded.size,checkUpload);
        });
      }
      else{
        res.redirect('/');
      }

    } else {
      res.redirect('/');
    }

});

//createDir
router.post('/createDir', function(req, res, next) {
    var currDirID = req.session.currDirID;
    var userID = req.session.userid

    if (req.session.userid) {
      db.serialize(function() {
        db.run('insert into directory values (NULL,?,?,?,?,?)',currDirID,uploaded.originalname,uploaded.filename,currTime(), uploaded.size,checkUpload);
      });
      
    } else {
      res.redirect('/');
    }

});


function currTime(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  today = mm+'/'+dd+'/'+yyyy;

  return today;
}


module.exports = router;