var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var config = require('config');
var url = config.get('LogDB.dbUri');

/* GET home page. */
router.post('/', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var log = req.body;
    db.collection("log").insertOne(log, function(err, res) {
      if (err){
        console.log(err);
      }
      console.log("1 log inserted.");
      db.close();
    });
  });
});

module.exports = router;
