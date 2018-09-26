var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var config = require('config');
var url = config.get('LogDB.dbUri');

/* GET home page. */
router.post('/', function(req, res) {
  if(config.get('LogDB.enable')){
    MongoClient.connect(url, function(err, db) {
      if(err){
        console.log(err);
      }
      var log = req.body;
      db.collection(config.get('LogDB.collection')).insertOne(log, function(err, dbRes) {
        if (err){
          console.log(err);
        }
        console.log("1 log inserted. " + log.time + " " + log.type);
        db.close();
        res.end();
      });
    });
  }
  else{
    res.end();
  }
});

module.exports = router;
