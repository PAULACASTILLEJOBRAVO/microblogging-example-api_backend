var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Post = require('../models/Posts');
var User = require('../models/User');
var db = mongoose.connection;

router.get("/",
function (req, res, next) {
    Post.find().sort("-publicationdate").populate('user').exec(function (err, posts) {
        if (err) res.status(500).send(err);
        else res.status(200).json(posts);
    })
});

module.exports = router;