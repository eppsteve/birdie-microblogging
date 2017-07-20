var User = require('../models/user.js');
var Tweet = require('../models/tweet.js');

exports.getHomeIndex = function(req, res, next){
    // get all the users we follow
    User.findOne({"username":req.user.username}).exec(function(err, data){
        if (err) console.log(err);

        if (data.follows.length >0 ){
            // we follow some people, retrieve all their tweets
            data.follows.push({"username":req.user.username}); //we also want to retrieve our tweets
            // console.log(data.follows);

            Tweet.find({$or: data.follows }).sort({"created_at":-1}).exec(function(err, result){
                if (err)
                    console.log(err);

                if (result.length >0 ){
                    res.render('home', {"posts":result, "username":req.user.username, "avatar":data.avatar});
                }else {
                    //noone has posted anything
                    res.render('home', {"message":"Your account is ready!", "avatar":data.avatar});
                }
            });
        }else {
            //we don't follow anyone, retrieve only our tweets
            Tweet.find({"username":req.user.username}).sort({"created_at":-1}).exec(function(err, result){
                if (err)
                    console.log(err);

                if (result.length >0 ){
                    res.render('home', {"posts":result, "username":req.user.username, "avatar":data.avatar});
                }else {
                    // we have not posted anything
                    res.render('home', {"message":"Your account is ready!", "username":req.user.username, "avatar":data.avatar});
                }
            });
        }
    });
}