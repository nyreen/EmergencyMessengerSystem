'use strict';

var globe = require('/../globelabs')(),
    config = require('/../config'),
    logger = require('morgan'),
    mongo = require('mongoskin'),
    auth = globe.Auth(config.appId, config.appSecret),
    db = mongo.db(config.mongo_db, {native_parser:true}),
    
    get_auth = function(req, res, next) {
        var access_token,
            subscriberNumber,
            code = request.query.code;
    
        if (!code) {
            return next('No code query!');  // use next() for sending errors messages
        }
    
        auth.getAccessToken(code, function(req, res) {
            var data = res.body;
            
            if (!data) {
                return  response.end(JSON.stringify(data, null, 4));
            }
        
            accessToken = data.access_token;
            subscriberNumber = data.subscriber_number;
            
            logger.info('Access Token:', accessToken); // only use console.log for debugging
            logger.info('Subscriber Number:', subscriberNumber); // use logger for logging

            // TODO If you want to add codes in here
            /*
            var document = {access_token : "MUCm9KpoM2nhTWqVVKqrhnxTiZa1vXJcUnZmVmTnnx8", subscriber_number:"9158208057"};
            db.accesstokens.insert(document, {w: 1}, function(err, records){
            console.log("Record added as "+records[0]._id);
            });
            */

            db.accesstokens.insert(
                {
                    access_token : accessToken,
                    subscriber_number:subscriberNumber
                }
            )

            res.end(JSON.stringify(data, null, 4));
        });
    };
    
return {
    get_auth : get_auth
};
