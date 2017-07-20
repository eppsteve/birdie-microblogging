var fileUpload = require('express-fileupload'); // midleware for file upload req.files
var path = require('path');                     // used for file path
var crypto = require('crypto');

var User = require('../models/user.js');


exports.getSettings = function(req, res, next){
        User.findOne({"username":req.user.username}, function(err, result){
            if (err){
                console.log(err);
                res.redirect('/settings');
            }
        
            res.render('settings', {"avatar": result.avatar, "cover":result.cover});
        });
}


exports.postUpload = function (req, res){

    var photo = req.body.photo; //contains 'avatar' or 'cover' depending on what the user updates
    var query;
    //create a secure random token for filename
    var random_id = crypto.randomBytes(20).toString('hex');
	var filepath = './uploads/' + random_id + '.jpg';
	var database_filepath = random_id + '.jpg';
	var targetPath = path.resolve(filepath);

    if (path.extname(req.files.file.name).toLowerCase() === '.jpg'){

        // move file to /uploads folder
        req.files.file.mv(targetPath, function(err){
             if (err){
                console.log(err);
                res.redirect('/settings');
            }

            if (photo == "avatar"){
                // update database with the filename of the new avatar
                User.update({'username':req.user.username}, {$set:{'avatar':database_filepath}}, function(err, object){
                        if (err){
                            console.warn(err.message);
                            res.redirect('/');
                        }else {
                            res.render('settings', 
                            {
                                "message": "Your avatar has been updated.", 
                                "avatar": database_filepath, 
                                "cover": req.user.cover,
                                "username": req.user.username
                            });
                        }
                    }
                );
            }else if(photo == "cover"){
                // update database with the filename of the new cover
                User.update({'username':req.user.username}, {$set:{'cover':database_filepath}}, function(err, object){
                        if (err){
                            console.warn(err.message);
                            res.redirect('/');
                        }else {
                            res.render('settings',
                             {
                                 "message": "Your cover has been updated.", 
                                 "cover": database_filepath, 
                                 "avatar": req.user.avatar, 
                                 "username": req.user.username
                            });
                        }
                    }
                );
            }

        });

    }else {
        console.log("only jpg allowed");
    }
}