var http = require("http");
var url = require('url');
var express = require('express');
var app = express();
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var file = "new.db"; 
var exists = fs.existsSync(file);
console.log("exists=" + exists);
var db = new sqlite3.Database(file);
console.log("db=" + db);

var retObj = { "original_url":null, "short_url":null };

function newRec(url) {
  db.serialize(function() {
    console.log("url=" + url);
    var stmt = db.prepare("INSERT INTO urls(longurl) VALUES(?)");
    stmt.run(url);  
    stmt.finalize();
  });
}

function getUrl(id) {
  db.serialize(function() {
    db.each("SELECT * FROM urls where id=" + id, function(err, row) {
      console.log("returing " + row.longurl);
      //res.end("url= " + row.longurl );  
    });
  }); 
}

function showTable() {
  db.serialize(function(url) {
    db.each("SELECT * FROM urls", function(err, row) {
      console.log(row.ID + ": " + row.longurl);
    });
  });
}

db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE urls ( ID	INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 	longurl	TEXT)");
    console.log("CREATING TABLE!");
  }
  
  //db.run("CREATE TABLE urls ( ID	INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, 	longurl	TEXT)");
  //console.log("CREATING TABLE!");
  
  // uncomment this to clear table
  //db.run("delete from urls");

  
  
  db.each("select name from sqlite_master where type='table'", function (err, table) {
        console.log(table);
    });
    
  //var stmt = db.prepare("INSERT INTO urls(longurl) VALUES(?)");  
  //stmt.run("google.com");  
  //stmt.finalize(); 
  
  showTable();
  
});

/*
app.get('/new/:url', function(req, res) {
  var url = req.params.url;
  console.log("url=" + url);
  newRec(url);
  console.log("url=" + url);
  showTable();
  

  db.serialize(function() {
    var qs = "SELECT * FROM urls where longurl='" + url + "'";
    console.log("qs= " + qs);
    db.each(qs, function(err, row) {
      console.log("final= " + row.ID);
      res.write("Hello World!");
      
      retObj.original_url = url;
      retObj.short_url = "https://cpinheir-url-short.glitch.me/" + row.ID;
      res.write(JSON.stringify(retObj));  
      res.end();
    });
  }); 
  
  //res.end('Hello World! ' + url);
})
*/

app.get('*', function(req, res) {
  var rp = req.params;
  var chk = rp["0"].substring(0,5);
  var url = rp["0"].substring(5);
  console.log("chk=" + chk);
  console.log("url=" + url);
  console.log("req.params=" + JSON.stringify(req.params));
  
  if (chk === "/new/") {  
    console.log("url=" + url);
    newRec(url);
    console.log("url=" + url);
    showTable();

    db.serialize(function() {
      var qs = "SELECT * FROM urls where longurl='" + url + "'";
      console.log("qs= " + qs);
      db.each(qs, function(err, row) {
        console.log("final= " + row.ID);
        res.write("Hello World!");

        retObj.original_url = url;
        retObj.short_url = "https://cpinheir-url-short.glitch.me/" + row.ID;
        res.write(JSON.stringify(retObj));  
        res.end();
      });
    }); 
    
  }
  else {
    
    if (rp["0"] === "/")  {
      res.end("Please add new URL or short URL.");
      return;
    }
    
    var id = rp["0"].substring(1);
    db.serialize(function() {
      db.each("SELECT * FROM urls where id=" + id, function(err, row) {
        console.log("returing " + row.longurl);
        res.redirect(301, row.longurl);
        //res.end("Hello EVeryone! " + id + ":" + row.longurl );  
      });
    });
  }
  
 
})

//db.close();



app.listen(8080);