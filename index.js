/*
* Main File for the API
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');

// Testing
// @TODO delete this
/*_data.create('test','newFile',{'foo':'bar'},function(err){
  console.log('this is the error', err);
});
*/

/*_data.update('test','newFile',{'foo':'world'},function(err){
  console.log('this is the error ',err);
});*/

/*_data.read('test','newFile',function(err,data){
  console.log('this was the error ',err, ' and this was the data ',data);
})*/

_data.delete('test','newFile',function(err){
  console.log('This is the error ', err);
});

// Instantiating an HTTPS Server
/*
var httpsServerOptions = {
'key':fs.readFileSync('./https/key.pem'),
'cert':fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions, function(req,res){
   //unifiedServer(req,res)
})
*/

// Instantiating and http server
var server = http.createServer(function(req,res){
  unifiedServer(req,res);
});

server.listen(config.port, function(){
  console.log("The Server is listening on port " +config.port+ " in " + config.envName + " now");
});

// Define the handlers
var handlers = {};

// Ping handler
handlers.ping = function(data,callback){
  // Callback a http status code and a payload object
  callback(200);
};

// Not found handlers
handlers.notFound = function(data, callback){
  callback(404);
};

// Define a request router
var router = {
  'ping' : handlers.ping
};

var unifiedServer = function(req,res){
  // Get the url and parse interval
  var parsedUrl = url.parse(req.url,true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the headers as object
  var headers = req.headers;

  // Get the http method
  var method = req.method.toLowerCase();

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();

    // Choose the handler this request should go to.
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'timmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload){
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler, or default to empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
};
