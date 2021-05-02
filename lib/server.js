/*
*  Server related tasks
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./data');
var helpers = require('./helpers');
var handlers = require('./handlers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('workers');

// Instantiate the server module object
var server = {};

// @Todo Get rid of this.
/*helpers.sendTwilioSms('4151234567','Hello!',function(err){
  debug('this was the error ', err);
});*/

// Instantiating an HTTPS Server
/*
server.httpsServerOptions = {
'key':fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
'cert':fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res){
   //server.unifiedServer(req,res)
})
*/

// Instantiating and http server
server.httpServer = http.createServer(function(req,res){
  server.unifiedServer(req,res);
});

// Define a request router
server.router = {
  'ping' : handlers.ping,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
};

server.unifiedServer = function(req,res){
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
    var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'timmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
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

      // If the response is 200, print green otherwise print red
      if(statusCode == 200){
        debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /' +trimmedPath+' '+statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /' +trimmedPath+' '+statusCode);
      }
    });
  });
};

// Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.port, function(){
    console.log('\x1b[36m%s\x1b[0m', "The Server is listening on port " +config.port+ " in " + config.envName + " now");
  });
};

// Export the server
module.exports = server;
