// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

var backgroundObject = function () {

  // This is the object that represents the stickyPad in the backround process
  // It will send messages to the active tab to update the display in the stickyPad
  var _stickyPad = function () {

    var _visible = false;

    var _hideInAllTabs = function () {
      for(var i = 0; i < safari.application.browserWindows.length; i++) {
        var currentWindow = safari.application.browserWindows[i];
        for(var j=0; j < currentWindow.tabs.length; j++) {
          var tab = currentWindow.tabs[j];
          tab.page.dispatchMessage('hideStickyPad', 'hideStickyPad');
        }
      }
    };


    var _showInActiveTab = function () {
      var theActiveWindow = safari.application.activeBrowserWindow;
      theActiveWindow.activeTab.page.dispatchMessage('showStickyPad', 'showStickyPad');
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



  var _handleCommand = function (event) {
    if(event.command === 'toggleStickyPadVisibility') {
      _stickyPad.toggleVisibility();
    }
  };


  var _setupCommandsListener = function() {
    safari.application.addEventListener("command", _handleCommand, false);
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
define(['jquery'], function(jquery) {
  return backgroundObject;
});
