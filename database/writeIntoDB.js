var objects = [{id: 0, name: "a", type: "A"},
               {id: 1, name: "b", type: "B"},
               {id: 2, name: "c"},
               {id: 3, name: "d"}];

var groups = [{id: 4, objs: [2,3], name:"CD"}];

// Messages with empty message contents and towards -1 are return messages
var messages = [{id: 0, from: 0, to: 1, message: "foo()"},
                {id: 1, from: 1, to: 2, message: "bar()"},
                {id: 2, from: 2, to: 0, message: "hoge()"},
                {id: 2, from: 2, to: -1, message: ""},
                {id: 3, from: 2, to: 3, message: "hogehoge()"},
                {id: 3, from: 2, to: -1, message: ""},
                {id: 4, from: 2, to: 0, message: "hoge()"},
                {id: 4, from: 2, to: -1, message: ""},
                {id: 5, from: 2, to: 3, message: "hogehoge()"},
                {id: 5, from: 2, to: -1, message: ""},
                {id: 6, from: 2, to: 0, message: "hoge()"},
                {id: 6, from: 2, to: -1, message: ""},
                {id: 7, from: 2, to: 3, message: "hogehoge()"},
                {id: 7, from: 2, to: -1, message: ""},
                {id: 1, from: 1, to: -1, message: ""},
                {id: 0, from: 0, to: -1, message: ""}];

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var config = require('config');
var url = config.get('SDExplorerDemo.dbUri');

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection("objects").insert(objects);
    db.collection("groups").insert(groups);
    db.collection("messages").insert(messages);
    db.close();
});
