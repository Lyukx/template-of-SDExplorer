var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/pacManSequenceDiagram';

/* GET home page. */
router.get('/messages', function(req, res, next) {
    var from = req.query.message.from;
    var to = req.query.message.to;
    var message = req.query.message.message;
    console.log(from);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("messages").find({message: new RegExp(message)}).toArray(function(err, result){
            if(err){
                console.error(err);
                res.statusCode = 500;
                res.send({
                    result: 'error',
                    err:    err.code
                });
            }
            var data = [];
            for(let msg of result){
                if(from.length != 0){
                    if(msg.from != parseInt(from)){
                        continue;
                    }
                }
                if(to.length != 0){
                    if(msg.to != parseInt(to)){
                        continue;
                    }
                }
                data.push(msg);
            }
            res.send(data);
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
