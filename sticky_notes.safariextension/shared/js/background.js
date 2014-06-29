// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

var backgroundObject = function () {

  // This is the object that represents the stickyPad in the backround process
  // It will send messages to the active tab to update the display in the stickyPad
  var _stickyPad = function () {

    var _visible = false;

    var _hideInAllTabs = function () {
      var _tabs = browser.getAllTabs();
      for(var i = 0; i < _tabs.length; i++) {
        var _tab = _tabs[i];
        browser.sendMessageToTab(_tab, 'hideStickyPad', 'hideStickyPad');
      }
    };


    var _showInActiveTab = function () {
      var _tab = browser.getActiveTab();
      browser.sendMessageToTab(_tab, 'showStickyPad', 'showStickyPad');
    };


    var self = {
      toggleVisibility : function () {
        _visible = !_visible;
        _hideInAllTabs();
        if(_visible == true) {
          _showInActiveTab();
        }
      }
    };

    return self;
  }.call();



  var _handleCommand = function (command_name) {
    if(command_name === 'toggleStickyPadVisibility') {
      _stickyPad.toggleVisibility();
    }
  };


  var _setupCommandsListener = function() {
    browser.addBackgroundCommandListener(_handleCommand);
  };


  var self = {
    setupListeners : function () {
      _setupCommandsListener();
    }
  };

  return self;

}.call();

// using require.js so here we return the background object
// using the define syntax stating the dependencies for this 'backround.js' script
define(['jquery', 'browser'], function(jquery, browser) {
  return backgroundObject;
});

