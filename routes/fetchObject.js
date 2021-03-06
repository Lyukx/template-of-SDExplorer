var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var config = require('config');
var url = config.get('SDExplorerDemo.dbUri');

/* GET home page. */
router.get('/', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("objects").find({}).toArray(function(err, result){
            if(err){
                console.error(err);
                res.statusCode = 500;
                res.send({
                    result: 'error',
                    err:    err.code
                });
            }
            res.send(result);
            db.close();
        });
    });
});

module.exports = router;
