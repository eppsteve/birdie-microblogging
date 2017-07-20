$(document).ready(function (){

    waitForTweets();

    // sends a logout request
    $('#btnLogout').click(function(){
        $.ajax({
            type: 'GET',
            dataType: 'json', 
            url: 'http://localhost:3000/logout', 
            success: function(data){
                console.log(data);
                window.location = '/';
            }, error: function(err){
                console.log('error: ', err);
            } 
        });
    });

    // when tweet form gets focus, expand the area
    $('#tweet').focus(function(){
        $('.tweet-form').css("height", "150px");
        $('.tweet-form').css("margin-bottom", "20px");
        $(this).attr('rows', '4');
    });

    // sends a retweet request
    $('.btn-retweet').click(function(){
        var tweet_id = $(this).data("id"); //get tweet id from data-attribute
        console.log(tweet_id);
        $.ajax({
            type: 'GET', 
            dataType: 'json', 
            url: 'http://localhost:3000/retweet/'+tweet_id, 
            success: function(data){
                console.log(data.message);
            }, error: function(err){
                console.log(err);
            }
        });
    });

    //send a favorite request
     $('.btn-fav').click(function(){
        var id = $(this).data("id"); //get id from data-attribute
        $.ajax({
            type: 'GET',
            dataType: 'json', 
            url: 'http://localhost:3000/fav/'+id, 
            success: function(data){
                console.log(data.message);
            }, error: function(data){
                console.log(data);
            }
        });
    });

    // when user clicks the reply button, get all replies and populate the reply modal window with data
    $('.btn-reply').on('click', function(){
        var id = $(this).data("id");                // get id from data attribute
        $('#modal-btn-reply').attr('data-id', id);  // add id to data-attribute of modal post button

        $.ajax({
            type: 'GET', 
            dataType: 'json', 
            url: 'http://localhost:3000/tweet/'+id, 
            success: function(tweet){
                
                //create label
                $('#modal-reply-label').text('Reply to '+tweet.username);
                //create tweet
                $('.modal-avatar').html('<a href="/user/'+tweet.userame+'"><img class="img-rounded" src="/'+tweet.avatar+'" /></a>');
                $('.modal-tweet-body').html('<div class="tweet-header" id="modal-tweet-header">' +
                                                '<a href="/user/'+tweet.username+'">'+tweet.username+'</a>' +
                                                '<span class="time"><a href="#">'+tweet.created_at+'</a></span></div>'+
                                                '<div class="tweet-text">'+tweet.tweet+'</div>');
                //create replies
                $.each(tweet.replies, function(index, reply){
                    $('.modal-replies').append(
                    '<div class="modal-reply">' +
                    '<div class="tweet-avatar"><a href="/user/'+reply.userame+'"><img class="img-rounded" src="/'+reply.avatar+'" /></a></div>' +
                    '<div class="tweet-body">' +
                        '<div class="tweet-header">'+
                            '<a href="/user/'+reply.username+'">'+reply.username+'</a>' +
                            '<span class="time"><a href="#">'+reply.created_at+'</a></span>' +
                        '</div>' +                     
                        '<div class="tweet-text">'+reply.message+'</div>' +
                    '</div></div>');
                });
            }, error: function(err){
                console.log(err);
            }
        });
    });

    // when user focuses on reply form, expand the area
    $('#modal-reply').focus(function(){
        $('.modal-reply-form').css("height", "150px");
        $(this).attr('rows', '4');
    });

    //clears replies and reset reply-form width when user closes the reply-modal
    $('#replyModalDialog').on('hidden.bs.modal', function(){
        $('#modal-reply').val('');        
        $('.modal-replies').html('');
        $('#modal-reply').attr('rows', '1');
        $('.modal-reply-form').css("height", "");
    });

    // submits the reply to the server
    $('#modal-btn-reply').click(function(){
        var id = $(this).data('id');
        $.ajax({
            type: 'POST', 
            dataType: 'json', 
            url: 'http://localhost:3000/reply/'+id, 
            data: {message: $('#modal-reply').val()}, 
            success: function(data){
                console.log(data.message);
                // clear text from reply form
                $('#modal-reply').val('');

                // append the reply below the last reply
                $('.modal-replies').append(
                    '<div class="modal-reply">' +
                    '<div class="tweet-avatar"><a href="/user/'+data.reply.userame+'"><img class="img-rounded" src="/'+data.reply.avatar+'" /></a></div>' +
                    '<div class="tweet-body">' +
                        '<div class="tweet-header">'+
                            '<a href="/user/'+data.reply.username+'">'+data.reply.username+'</a>' +
                            '<span class="time"><a href="#">'+data.reply.created_at+'</a></span>' +
                        '</div>' +                     
                        '<div class="tweet-text">'+data.reply.message+'</div>' +
                    '</div></div>');
            }, error: function (err){
                console.log(err);
            }
        });
    });

    // submits the tweet to the server
    $('#btnPost').click(function(){
        $.ajax({
            type: 'POST', 
            dataType: 'json', 
            url: 'http://localhost:3000/tweet', 
            data: {tweet: $('#tweet').val()}, 
            success: function(data){
                console.log(data.message);
                if (data.message == 'Your tweet has been posted!'){
                    $('#tweet').val('');
                }
               
            }, error: function(err){
                console.log('error: ', err);
            }
        });
    });

    // post tweet to the server from the modal window
    $('#btn-post-modal').click(function(){
        $.ajax({
         type: 'POST', 
            dataType: 'json', 
            url: 'http://localhost:3000/tweet', 
            data: {tweet: $('#modal-tweet').val()}, 
            success: function(data){
                console.log(data);
            }, error: function(error){
                console.log(error);
            }
        });
        $('#modal-tweet').val('');
    });

    // sends a follow request
    $('#btn-follow').click(function(){
        var user = $(this).data("user"); //get username from data-attribute
        $.ajax({
            type: 'GET',
            dataType: 'json', 
            url: 'http://localhost:3000/follow/'+user, 
            success: function(data){
                console.log(data.message);
                // show unfollow button
                $('#btn-follow').hide();
                $('.profile-buttons').append(
                    '<button type="button" class="btn btn-default btn-unfollow" aria-label="Follow" id="btn-unfollow" data-user="' +data.user+ '">' +
                    '<span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span> Unfollow </button>');
            }, error: function(data){
                console.log(data);
            }
        });
    });

    // sends a unfollow request
    $('#btn-unfollow').click(function(){
        var user = $(this).data("user"); //get username from data-attribute
        $.ajax({
            type: 'GET',
            dataType: 'json', 
            url: 'http://localhost:3000/unfollow/'+user, 
            success: function(data){
                console.log(data.message);
                // show follow button
                $('#btn-unfollow').hide();
                $('.profile-buttons').append(
                    '<button type="button" class="btn btn-default btn-follow" aria-label="Follow" id="btn-follow" data-user="'+data.user+'">' +
                    '<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> Follow </button>');
            }, error: function(data){
                console.log(data);
            }
        });
    });
});

var timestamp = new Date();

function waitForTweets(){
    // long polling implementation, sends asynchronous requests 
    // in 5s time interval to check and fetch new tweets
    $.ajax({
        type: 'GET', 
        dataType: 'json', 
        url: 'http://localhost:3000/tweets/'+timestamp, 
        async: true, 
        cache: false, 

        success: function(data){
            console.log(data);
            if (data.tweets != "no new tweets"){

                $.each(data.tweets, function(index, value){
                    $('.posts').prepend('<div class="tweet"> '+
                        ' <div class="tweet-avatar"><a href="/user/' +value.username+ '"><img class="img-rounded" src="' +value.avatar +'" /></a></div> '+
                        ' <div class="tweet-body">'+
                        '     <div class="tweet-header"><a href="/user/' +value.username+ '">' +value.username+ '</a>'+
                        '     <span class="time"><a href="#" data-id="' +value._id+ '" >'+value.created_at+'</a></span></div>'+
                        '     <div class="tweet-text">' +value.tweet+ '</div>'+
                        ' </div>'+
                        ' <div class="tweet-buttons">'+
                        '         <button type="button" class="btn btn-link btn-xs btn-fav" data-id="'+value._id+'">'+
                        '             <span class="glyphicon glyphicon-star" aria-hidden="true"></span> Favourite'+
                        '         </button>'+
                        '         <button type="button" class="btn btn-link btn-xs btn-retweet" data-id="'+value._id+'">'+
                        '             <span class="glyphicon glyphicon-share-alt" aria-hidden="true"></span> Retweet'+
                        '         </button>'+
                        '        <button type="button" class="btn btn-link btn-xs btn-reply" data-id="'+value._id+'" data-toggle="modal" data-target="#replyModalDialog">' +
                        '           <span class="glyphicon glyphicon-share-alt" aria-hidden="true"></span> Reply' +
                        '        </button>' +
                        ' </div>' +
                        ' </div>');
                });

                $('.tweet').slice(0, data.tweets.length).show();
            }
            //var tmp_timestamp = data.timestamp;
            //timestamp = new Date(tmp_timestamp).toISOString();
            timestamp = data.timestamp;
            //console.log("timestamp: " +timestamp);
            setTimeout(waitForTweets, 10000); // setup the next poll recursively after 5sec
        }, 
        error: function(error){
            console.log(error);
            setTimeout(waitForTweets, 5000) // try again after 5sec
        }
    });
}