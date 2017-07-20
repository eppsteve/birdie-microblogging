var mongoose = require('mongoose');

var TweetSchema = new mongoose.Schema({
    username: String,
    avatar: String,
    tweet: String, 
    retweeted_by: [String], 
    favorited_by: [{
        username: String
    }], 
    replies: [{
        username: String, 
        message: String, 
        avatar: String, 
        created_at: Date
    }], 
    created_at: Date 
});

module.exports = mongoose.model('Tweet', TweetSchema);