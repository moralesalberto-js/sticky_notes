// This is the main background script that will run in the Firefox extension
// The script runs once, every time Firefox is started.

//This is NOT the same for all browsers

// Require the things you want the way the extension wants it
var _ = require("./shared/lib/underscore");

var background = require("./shared/background");

  //Commands and buttons set up adapter.
  var commandsAdapter = function(){
    _setupButton();
    _setUpOthersButtons();
  };


  //Scripts injection adapter
  var scriptsAdapter = function() {
    _injectScripts();
    _injectStyles();
  };


  commandsAdapter.setupAll();
  scriptsAdapter.setupAll();

//Call the shared background script that
  background.setupListeners();

