var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Post = require('../models/Posts');
var User = require('../models/User');
var db = mongoose.connection;

router.get("/",
function (req, res) {
    Post.find().sort("-publicationdate").populate('user').exec(function (err, posts) {
        if (err) res.status(500).send(err);
        else res.status(200).json(posts);
    })
});

router.get("/all/:id",
function (req, res) {
    Post.find({'user':req.params.id}).sort("-publicationdate").populate('user').exec(function (err, posts) {
        if (err) res.status(500).send(err);
        else res.status(200).json(posts);
    })
});

router.post("/", function(req, res, next){
    User.findById(req.body.iduser, function(err, userinfo){
        if(err) res.status(500).send(err);
        else{
            var postInstance = new Post({
                user: req.body.iduser,
                title: req.body.title,
                description: req.body.description
            });
            userinfo.posts.push(postInstance);
            userinfo.save(function(err){
                if(err) res.status(500).send(err);
                else{
                    postInstance.save(function(err){
                        if(err) res.status(500).send(err);
                        res.sendStatus(200);
                    });
                }
            });
        }
    });
});

router.put('/:id', function(req, res){
    Post.findByIdAndUpdate(req.params.id, res.body, function(err, postinfo){
        if(err) res.status(500).send(err);
        res.sendStatus(200);
    });
});

router.delete('/:id', function(req, res, next){
    Post.findByIdAndDelete(req.params.id, function(err, postinfo){
        if(err) res.status(500).send(err);
        else{
            User.findByIdAndUpdate(postinfo.user, {$pull: {posts: postinfo._id}},
                function(err, userinfo){
                    if(err) res.status(500).send(err);
                    res.sendStatus(200);
                });
        }
    });
});

module.exports = router;