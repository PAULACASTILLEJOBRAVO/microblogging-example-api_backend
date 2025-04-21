var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    email: {
        type: String,
        required: true
    },
    publicationdate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);