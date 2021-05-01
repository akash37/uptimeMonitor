/*
* Helpers for various tasks
*/

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for all the Helpers
var helpers = {}

// Create a SHA-256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {}
  }
};

// Create a string of random characters of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all possible characters allowed in the string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // Start the final string
    var str = '';
    for(i=1;i<=strLength;i++){
      // Get a random character from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the final string
      str+=randomCharacter;
    }
    return str;
  }
}

// Export the module
module.exports = helpers;
