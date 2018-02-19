var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = config.get('SDExplorerDemo.dbUri');

var PAGE_NUM = 5000;

/* GET home page. */
router.get('/:page', function(req, res, next) {
    var page = parseInt(req.params.page);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("messages").find({}).limit(PAGE_NUM).skip(page * PAGE_NUM).toArray(function(err, result){
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
