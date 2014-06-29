// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

var backgroundObject = function () {

  var _stickyPadIsVisible = false;

  var _handleCommand = function (event) {
    // the user clicked on the button in the toolbar
    // in the extension builder the command string is set to 'toggleNotepadVisibility'
    if(event.command === 'toggleStickyPadVisibility') {
      // toggle the visibility
      _stickyPadIsVisible = !_stickyPadIsVisible;


      // tell all windows and tabs to hide the stickyPad
      // we only show the stickyPad in the activeTab; we do not show more than one instance

      // tell the active tab to show the stickyPad if wanting visibility
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
