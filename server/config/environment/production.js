'use strict';

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP ||
    process.env.IP ||
    undefined,

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT ||
    process.env.PORT ||
    8080,

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://' + (process.env.MONGO_1_PORT_27017_TCP_ADDR || 'mongo') + ':27017/metalisttickets'
  }
    // MongoDB connection options

};
