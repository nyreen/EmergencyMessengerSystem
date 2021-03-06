var express = require('express'),
    globe = require('globelabs')(),

    https = require('https'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'), // query/post string parser
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    mongo = require('mongoskin'),
    db = mongo.db("mongodb://localhost:27017/sp2", {native_parser:true}),

    routes = require('./routes/index'),
    users = require('./routes/users'),

    app = express(),
    lbsURL,
    mapURL,
    newURL,
    newVal = '',
    paramToChange = '',
    nearest_Agency,

    // Application Settings
    appShortCode = '21580830', // full short code
    appId = '7AX6fdya8RfA7TzryMia6EfaEAMEfX47', // application id
    appSecret = '8c74577a17aad85d1c544332c2899a0200fd2a7a713aa83f9f613cfcf395cdef', // application secret
    accessToken = "ZatfYupAPlWPf_-9iblmWL_JQ1NjPTNg2pvTfKFFYm4",
    subscriberNumber = "9353710926",
    sms,
    message,

    // Getting the login url
    auth = globe.Auth(appId, appSecret),

    callbackUrlPath = '/auth',
    notifyUrlPath = '/messagenew'

    server_port = process.env.OPENSHIFT_NODEJS_PORT || '8080',
    server = http.createServer(app),
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', server_port);


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//Getting the access token and the subscriber number
app.get(callbackUrlPath, function(request, response, next) {

    // Express Framework automatically parse the queries
    var code = request.query['code'];

    // check the code
    if (!code) {
        response.writeHead(400); // Bad Request
        response.end('No code query!');
        return;
    }

    // Get the access token using the code
        auth.getAccessToken(code, function(req, res) {
        var data = res.body;
        // we assumed that the request is successful
        if (res.statusCode === 200 && data && data['access_token']) {

            // Get the access_token and subscriber number
            accessToken = data['access_token'];
            subscriberNumber = data['subscriber_number'];
            console.log('Access Token:', accessToken);
            console.log('Subscriber Number:', subscriberNumber);

            // TODO If you want to add codes in here   
            var document = {
                access_token : accessToken,
                subscriber_number:subscriberNumber
            };

            db.collection('accesstokens').insert(document, {w: 1}, function(err, records){
                console.log("Record added as "+records[0]._id);
            });

            // Sends the error
            response.end(JSON.stringify(data, null, 4));
        } else {
            // Sends the error
            response.end(JSON.stringify(data, null, 4));
        }
    });
}); //Access_token and Subscriber_name

function sendSMS(){
    // Build up SMS
    sms = globe.SMS(appShortCode, subscriberNumber, accessToken);

    // Sends a message
    message = 'Hello World! ' + new Date().toISOString(); // set your custom message here
    sms.sendMessage(message, function(req, res) {
        console.log('SMS Response:', res.body);
    });
}

for(var i=0; i<1; i++){
    receiveMessage();
}
/*
//Receiving message from GlobeLabs Callback URI
app.post(notifyUrlPath, function(request, response, next) {

    // Express Framework automatically parse the queries
    var code = request.query['code'];

    // check the code
    if (!code) {
        response.writeHead(400); // Bad Request
        response.end('No code query!');
        return;
    }

    // Get the access token using the code
        //auth.getAccessToken(code, function(req, res) {
        var data = res.body;
        // we assumed that the request is successful
        if (res.statusCode === 200 && data) {
            console.log(data);

            // Sends the error
            response.end(JSON.stringify(data, null, 4));
        } else {
            // Sends the error
            response.end(JSON.stringify(data, null, 4));
        }
}); //Receive message
*/

function receiveMessage(){
    
    app.post(notifyUrlPath, function(request, response, next) {
        // Express Framework automatically parse the post data
        console.log(request);
        // Sends the data as JSON
        console.log(response);
        response.end(JSON.stringify(request.body, null, 4));
    }); //Receiving message
}

function updateURLParameter(url, param, paramVal){
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function LBSrequest(){
    lbsURL = "https://devapi.globelabs.com.ph/location/v1/queries/location?access_token=A49XCUH1x4fzuylU4DPNBX2qdNgyjF7iix94Ogqntxo&address=09364486873&requestedAccuracy=100";
    
    if(paramToChange != '' && newVal != ''){
        newURL = updateURLParameter(mapURL, paramToChange, newVal);
    }
    else{
        newURL = lbsURL;
    }

    //LBS Request
    https.get(newURL,function(res){
        var str = '';
        console.log('Response is '+res.statusCode);

        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            str += chunk;
        });

        res.on('end', function () {
            catchLBSRequest(str);
        });
    });

    function catchLBSRequest(str){
        var json = str,
        obj = JSON.parse(json);

        console.log(obj.terminalLocationList.terminalLocation.currentLocation.latitude);
        console.log(obj.terminalLocationList.terminalLocation.currentLocation.longitude);
    }
}

function catchNSRequest(str){
    var json = str,
    obj = JSON.parse(json);

    //console.log(obj.results);

    nearest_Agency = obj.results[0].name;
    //console.log("Nearby Search Request. Nearest agency: ");
    //console.log(nearest_Agency);

    db.collection('contacts').find({a_name : nearest_Agency}).toArray(function (err, items) {
        if (err) throw err;
        //console.log("contacts DB query, contact number: ");
        numToSend = items[0].contact_num;
        //console.log(numToSend);
    });
}

function mapRequest() {
    mapURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=13.944199, 121.630846&rankby=distance&types=hospital&key=AIzaSyBKiAeDewyk0_rwAiKLr8QaEqTQ3FsX01E';

    //paramToChange = "location";
    //newVal = '14.167821, 121.243303';

    if(paramToChange != '' && newVal != ''){
        newURL = updateURLParameter(mapURL, paramToChange, newVal);
    }
    else{
        newURL = mapURL;
    }

    //Nearby Search Request
    https.get(newURL,function(res){
        var str = '';
        console.log('Response is '+res.statusCode);

        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            str += chunk;
        });

        res.on('end', function () {
            catchNSRequest(str);
        });
    });
}

server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});

module.exports = app;