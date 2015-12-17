var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var util = require('util');
//var sync = require('sync');

sqlite3.verbose();
var db = new sqlite3.Database('mydb.db');
db.run("PRAGMA foreign_keys=ON");
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
      
      //console.log("driectories: " + util.inspect(directories, false, null));
      //console.log("files: " + util.inspect(files, false, null));
      for(i=0; i< files.length; ++i){
        files[i].size = convertBytes(files[i].size);
      }

      res.render("index", {title: 'bitDrive', files: files, dirs: directories, currDir : "root >", path: ['root', rootID]});
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

//home/:id
router.get('/home/:id', function(req, res) {
    var dirID = req.params.id;

    var directories = [];
    var files = [];
    var path = [];
    var reqDirID;
    var done = 0;

    var nextParentID;

    function syncSQL(){
      var callback = function(err, result){
        
        if(result){
          path.unshift(result.dir_name,result.dir_id);
          nextParentID = result.parent_dir_id;
          if(result.dir_name == "root"){
            //console.log("FINAL PATH : "+ util.inspect(path, false, null));
            for(i=0; i< files.length; ++i){
              files[i].size = convertBytes(files[i].size);
            }
            res.render("index", {title: 'bitDrive', files: files, dirs: directories, currDir : req.session.currDirName,path:path});
            return;
          }
          retrieve(nextParentID);
        }else{
          for(i=0; i< files.length; ++i){
            files[i].size = convertBytes(files[i].size);
          }
          res.render("index", {title: 'bitDrive', files: files, dirs: directories, currDir : req.session.currDirName});
        }
      }

      var retrieve = function(newID){
        db.serialize(function() {
              db.get("select *\
                       from directory\
                       where dir_id = ? ", newID, callback);
        });
      }

      path.unshift(req.session.currDirName,reqDirID);
      retrieve(nextParentID);
      
    }

    var getFiles = function(err, result){
      if(result){
        files = result;
      }
      syncSQL();
    }

    var getDirs = function(err, result){
      if(result){
        directories = result;
      }
      db.serialize(function() {
            db.all("select *\
                     from file\
                     where dir_id = ? ", reqDirID, getFiles);
      });

    }

    var getRoot = function(err, result){
      if(result){
        if(result.dir_name == 'root'){
          res.redirect('/home');
          return;
        }
        reqDirID = result.dir_id;
        req.session.currDirID = reqDirID;
        req.session.currDirName = result.dir_name;
        nextParentID = result.parent_dir_id;
        db.serialize(function() {
              db.all("select *\
                       from directory\
                       where parent_dir_id = ? ", reqDirID, getDirs);
        });
      }else{
        console.log(err);
        res.redirect('/');
        //getDirs(undefined,undefined);
      }
    }

    if (req.session.userid) {
      //res.render("index", {title: 'bitDrive'});

      db.serialize(function() {
            db.get("select *\
                     from directory\
                     where user_id = ? and dir_id = ? ", req.session.userid, dirID, getRoot);
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
    console.log("currDirID: "+currDirID);

    var checkUpload =  function(err){
      if(err){
        console.log(err);
      }
        res.redirect("/home/"+currDirID);
    }

    if (req.session.userid) {
      console.log("uploaded file: "+util.inspect(uploaded, false, null))
      if(uploaded){
        db.serialize(function() {
          db.run('insert into file values (NULL,?,?,?,?,?)',currDirID,uploaded.originalname,uploaded.filename,currTime(), uploaded.size,checkUpload);
        });
      }
      else{
        res.redirect("/home/"+currDirID);
      }

    } else {
      res.redirect("/home/"+currDirID);
    }

});

//createDir
router.post('/createDir', function(req, res, next) {
    var currDirID = req.session.currDirID;
    var userID = req.session.userid
    var newDirName = req.body.dirName;

    console.log("create dir: "+util.inspect(req.body, false, null));
    //res.redirect('/');
    
    if (req.session.userid) {
      db.serialize(function() {
        db.run('insert into directory values (NULL,?,?,?,?)',newDirName,req.session.userid,currDirID,currTime());
      }); 
      res.redirect('/home/'+currDirID)
    } else {
      res.redirect('/');
    }

});

//logout
router.post('/download', function(req, res) {
    fileID = req.body.fileID;
    
    var getFile =  function(err,result){
      if(result){
        console.log(util.inspect(result, false, null))
        console.log()
        res.download("uploads/"+result.file_path,result.file_name, function(err){
              if (err) {
                console.log('download error: '+err)
              } else {
                // decrement a download credit, etc.
              }
            }); 
      }else{
        res.end();
      }
    }

    if (req.session.userid) {
      db.serialize(function() {
              db.get("select *\
                       from file\
                       where file_id = ? ", fileID, getFile);
      });
    } else {
      res.redirect('/');
    }

});


//renameDir
router.post('/renameDir', function(req, res, next) {
    var userID = req.session.userid
    var newDirName = req.body.directoryName;
    var dirID = req.body.directoryID;
    var currDirID = req.session.currDirID;

    var checkRename =  function(err,result){
      if(err){console.log("rename error: " +err);}
      else{
        res.redirect('/home/'+currDirID);
      }

    }

    if (req.session.userid) {
      db.serialize(function() {
        db.run('update directory set dir_name = ? where dir_id = ?',newDirName,dirID,checkRename);
      }); 
      //res.redirect('/home/'+currDirID)
    } else {
      res.redirect('/');
    }

});

//renameFile
router.post('/renameFile', function(req, res, next) {
    var userID = req.session.userid
    var newfileName = req.body.fileName;
    var fileID = req.body.fileID;
    var currDirID = req.session.currDirID;

    var checkRename =  function(err,result){
      if(err){console.log("rename error: " +err);}
      else{
        res.redirect('/home/'+currDirID);
      }

    }

    if (req.session.userid) {
      db.serialize(function() {
        db.run('update file set file_name = ? where file_id = ?',newfileName,fileID,checkRename);
      }); 
      //res.redirect('/home/'+currDirID)
    } else {
      res.redirect('/');
    }

});

//deleteDir
router.post('/deleteDir', function(req, res, next) {
    var userID = req.session.userid
    var dirID = req.body.directoryID;
    var currDirID = req.session.currDirID;

    var checkDelete =  function(err,result){
      if(err){console.log("delete error: " +err);}
      else{
        res.redirect('/home/'+currDirID);
      }

    }

    if (req.session.userid) {
      db.serialize(function() {
        db.run('delete from directory where dir_id = ?',dirID,checkDelete);
      }); 
      //res.redirect('/home/'+currDirID)
    } else {
      res.redirect('/');
    }

});


//deleteFile
router.post('/deleteFile', function(req, res, next) {
    var userID = req.session.userid
    var fileID = req.body.fileID;
    var currDirID = req.session.currDirID;
    //console.log("Delete info: id - "+ fileID)
    var checkDelete =  function(err,result){
      if(err){console.log("delete error: " +err);}
      else{
        res.redirect('/home/'+currDirID);
      }

    }

    if (req.session.userid) {
      db.serialize(function() {
        db.run('delete from file where file_id = ?',fileID,checkDelete);
      }); 
      //res.redirect('/home/'+currDirID)
    } else {
      res.redirect('/');
    }

});

//logout
router.post('/logout', function(req, res) {
    req.session.destroy(function(err){
        if (err) {
            console.log("Error logout: %s", err);
        }
    });
    res.redirect("/");
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

function convertBytes(bytes){
  console.log("bytes in: "+bytes);

  if(bytes < 1000){
    return bytes +" Bytes";
  }else if(bytes < 1000000){
    //console.log("bytes out: "+bytes/1000 +" KB");
    return Math.floor((bytes/1000)*10)/10 +" KB";
  }else if(bytes < 1000000000){
    //console.log("bytes out: "+bytes/1000000 + " MB");
    return Math.floor((bytes/1000000)*10)/10 + " MB";
  }else{
    //console.log("bytes out: "+bytes/1000000000 + " GB");
    return Math.floor((bytes/1000000000)*100)/100 + " GB";
  }
}

module.exports = router;
