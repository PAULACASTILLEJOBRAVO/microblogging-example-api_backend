var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var Post = require('./Post.js');

var bcrypt = require('bcryptjs');

var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: {
        type: String, 
        require: true, 
        index: {
            unique: true
        }
    },
    password: {
        type: String, 
        require: true
    },
    fullname: String,
    email: {
        type: String, 
        require: true
    },
    creationdate:{
        type: Date, 
        default: Date.now
    },
    role: {
        type: String,
        enum: [
            'admin',
            'subscriber'
        ],
        default: 'subscriber'
    },
    posts:[
        {
            type: Schema.ObjectId,
            ref: 'Post',
            default: null
        }
    ]
});

UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMath){
        if (err) return cb(err);
        cb(null, isMath);
    });
};

module.exports = mongoose.model('User', PostSchema);