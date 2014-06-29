// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

var backgroundObject = function () {

  var _stickyPadIsVisible = false;

  // iterate through all the windows, all the tabs in the window
  // and send a message to the tab to close the stickyPad
  var _closeStickyPadInAllWindows = function () {
    for(var i = 0; i < safari.application.browserWindows.length; i++) {
      var currentWindow = safari.application.browserWindows[i];
      for(var j=0; j < currentWindow.tabs.length; j++) {
        var tab = currentWindow.tabs[j];
        tab.page.dispatchMessage('hideStickyPad', 'hideStickyPad');
      }
    }
  };

  var _handleCommand = function (event) {
    // the user clicked on the button in the toolbar
    // in the extension builder the command string is set to 'toggleNotepadVisibility'
    if(event.command === 'toggleStickyPadVisibility') {
      // toggle the visibility
      _stickyPadIsVisible = !_stickyPadIsVisible;


      // tell all windows and tabs to hide the stickyPad
      _closeStickyPadInAllWindows();

      // tell the active tab to show the stickyPad if wanting visibility
      // we only show the stickyPad in the activeTab
      if(_stickyPadIsVisible === true) {
        var theActiveWindow = safari.application.activeBrowserWindow;
        theActiveWindow.activeTab.page.dispatchMessage('showStickyPad', 'showStickyPad');
      }

    }
  };


  var _setupCommandsListener = function() {
    safari.application.addEventListener("command", _handleCommand, false);
  };

  var self = {
    // function to handle the commands from clicks on the toolbar
    // and the messages we may receive from the injected scripts
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
