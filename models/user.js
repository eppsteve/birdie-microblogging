var mongoose = require('mongoose');

// define user schema
var UserSchema = new mongoose.Schema({
    email: String, 
    username: String, 
    password: String, 
    avatar: String, 
    cover: String, 
    created_at: Date,
    follows: [{
        username: String,
        _id: false              //prevent mongodb from adding _id field 
    }]
});

// export the model
module.exports = mongoose.model('User', UserSchema);