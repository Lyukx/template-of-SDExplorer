var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/pacManSequenceDiagram';

/* GET home page. */
router.get('/:page', function(req, res, next) {
    var page = parseInt(req.params.page);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("message_id").find({}).limit(10000).skip(page * 5000).toArray(function(err, result){
            if(err){
                console.error(err);
                res.statusCode = 500;
                res.send({
                    result: 'error',
                    err:    err.code
                });
            }
            res.send(result);
        });
    });
});

module.exports = router;