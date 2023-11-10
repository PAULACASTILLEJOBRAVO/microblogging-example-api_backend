var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var Post = require('./User.js');

var PostSchema = new Schema({
    user: {
        type: Schema.ObjectId, 
        ref: 'User'
    },
    title: String,
    description: String,
    publicationDate: {
        type: Date, 
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);