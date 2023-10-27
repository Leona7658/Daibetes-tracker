const { create } = require("../../models/record");

const helpers = {


  // a  tag to check if the data has already been recorded
  ifRecorded: function (status, options) {
    if (status == "recorded") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // a  tag to check if the data has already been recorded
  ifUnrecorded: function (status, options) {
    if (status == "unrecorded") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

   // a  tag to check if is required 
  ifUnrequired: function (status, options) {
    if (status == "unrequired") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // a  tag to check if is abnormal 
  ifAbnormal: function (min, max, value, options) {
    
    if (value < min || value > max) {
      return options.fn(this);

    }
    return options.inverse(this);
  },

   // a  tag to check if is used recently 
  ifRecent: function (date, options) {
    var today = new Date().toDateString();
    if (date === today) {
      return options.fn(this);
    }
    return options.inverse(this);
  },


  // a  tag to check if data is required to record

  ifRequired: function (status, options) {
    if (status != "unrequired") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // a  tag to check if it is patient 
  ifPatient: function (role, options) {
    if (role == "patient"){
      return options.fn(this);
    }
    return options.inverse(this);
  },

  //checking if badge should be display
  ifBadge: function(eRate, options){
    if (eRate >= 0.8) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // find out the recorded time of data 
  findTime: function(createdAt) {
    if (createdAt){
      const time = createdAt.split(",");
      return time[1];
    }
    return createdAt;
  
  },
  // for displaying position in leaderboard
  rankPosition: function(index){
    return index+1;
  },

  
 

};

module.exports.helpers = helpers;
