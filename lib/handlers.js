/*
* Request handlers
*/

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

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

// users
handlers.users = function(data, callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
}

// Container for the users submethods
handlers._users = {};
// Users-post
// Required Data: firstName, lastName, phone, password, tosAgreement
// Optional data: None
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    // Make sure that the user doesn't already existing
    _data.read('users',phone,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = helpers.hash(password);
        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the users
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error': 'Could not create a new user'});
            }
          });
        } else{
          callback(500, {'Error' : 'Could not hash password'});
        }
      } else{
        // User already exists
        callback(400, {'Error' : 'A user with that phone number already exists'})
      }
    });
  } else{
    callback(400, {'Error' : 'Missing Required Fields'});
  }
};

// Users-Get
// Required data: phone
// Optional data: none
// @TODO Only let authenticated user access their object.
handlers._users.get = function(data,callback){
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        // Remove the hashedPassword
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });

  } else{
    callback(400, {'Error' : 'Missing required field'});
  }
};

// Users-put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specifies)
// @TODO Only let an authenicated user update the object
handlers._users.put = function(data,callback){
  // Check for required fields
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for the optional Data
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  // Error if phone is invalid
  if(phone){
    // Error if nothing is sent to update
    if(firstName || lastName || password){
      // Lookup the user
      _data.read('users',phone,function(err,userData){
        if(!err && userData){
          //Update the necessary fields
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }

          // Store the new updates
          _data.update('users',phone,userData,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err)
              callback(500, {'Error': 'Could not update the user'});
            }
          });
        }else{
          callback(400, {'Error' : 'The Specified user does not exist'});
        }
      });

    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else{
    callback(400, {'Error' : 'Missing Required Field'});
  }

};

// Users-delete
// Required Field: phone
// @TODO Only let authenicated user delete their object.
// @TDOD Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data,callback){
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        _data.delete('users',phone,function(err){
          if(!err){
            callback(200);
          } else{
            callback(500, {'Error':'Could not delete the specified user'});
          }
        });
      } else {
        callback(400, {'Error':'Could not find the specified user'});
      }
    });
  } else{
    console.log(400, {'Error' : 'Missing Required Field'});
  }
};

// Export the module
module.exports = handlers;
