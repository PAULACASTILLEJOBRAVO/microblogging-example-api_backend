var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var debug = require("debug")("microblogging-example-api:Users-model");

//Para la encriptación del password
var bcrypt = require("bcryptjs");

var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    fullname: String,
    email: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: false,
        default: 'suscriptor'
    },
    creationdate: {
        type: Date,
        default: Date.now,
        required: false
    },
    posts: [
        {
            type: Schema.ObjectId, 
            ref: 'Post', 
            default: null,
            required: false
        }
    ],
    aboutMe: {
        type: String,
        required: false
    },
});

/* El pre middleware se ejecuta antes de que suceda la operacion. 
Por ejemplo, un middleware pre-save sera ejecutado antes de salvar 
el documento.  */

UserSchema.pre("save", next => {
    var user = this;

    debug("En middleware pre (save)...");
    
    // solo aplica una función hash al password si ha sido modificado (o es nuevo)
    if (!user.isModified("password")) return next();
    
    // genera la salt
    bcrypt.genSalt(SALT_WORK_FACTOR)
        .then(salt => {
            // aplica una función hash al password usando la nueva salt
            bcrypt.hash(user.password, salt)
        })
        .then(hash => {
            // sobrescribe el password escrito con el “hasheado”
            user.password = hash;
            next();
        })
        .catch(err => next(err));
});


UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);