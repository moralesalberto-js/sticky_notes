// This is the adapater object that will wrap all the  specific calls
// Use the SAME interface for the other browsers

var browser = function () {

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self = {
    getAllTabs: function () {
      //Return all tabs
    },
  };

  return self;

}.call();



