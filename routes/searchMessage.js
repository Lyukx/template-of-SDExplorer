var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var config = require('config');
var url = config.get('SDExplorerDemo.dbUri');

/* GET home page. */
router.get('/messages', function(req, res, next) {
    var from = req.query.message.from;
    var to = req.query.message.to;
    var message = req.query.message.message;
    var queryArray = [];
    if(from.length != 0){
        queryArray.push({from: parseInt(from)});
    }
    if(to.length != 0){
        queryArray.push({to: parseInt(to)});
    }
    if(message.length != 0){
        queryArray.push({message: new RegExp(message)});
    }
    var query = {$and : queryArray};
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("messages").find(query).toArray(function(err, result){
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

router.post('/', function(req, res){
    var filterList = req.body['filterList'];
    if(filterList == undefined){
        console.log("err");
        res.statusCode = 404;
    }
    else{
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            db.collection("groups").find({}).toArray(function(err, result){
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
    }
});

module.exports = router;
