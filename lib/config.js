/*
* Create and export configuration variables
*/

// Container for all the environments

var environments = {}
// Staging (default) environments
environments.staging = {
  'port' : 3000,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : '',
    'authToken' : '',
    'fromPhone' : ''
  }
};

// Production environment
environments.production = {
  'port' : 5000,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAnotherSecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : '',
    'authToken' : '',
    'fromPhone' : ''
  }
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the envio mentiones above
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module

module.exports = environmentToExport;
