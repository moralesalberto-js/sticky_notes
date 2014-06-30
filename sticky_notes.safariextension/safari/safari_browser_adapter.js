// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var browser = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessageListenerFunction;
  var _backgroundCommandListenerFunction;

  // we receive the event in Safari native signature
  // we translate it to the two variables in the shared interface
  // _function(message_name, message_data)
  var _injectedRespondToMessage = function(theMessageEvent) {
    _injectedMessageListenerFunction(theMessageEvent.name, theMessageEvent.message);
  };

  // this receives the command (click of toolbar) by Safari
  // sends it translated to the signature of the generic response to command
  // _function(command_name)
  var _backgroundRespondToCommand = function(theCommandEvent) {
    _backgroundCommandListenerFunction(theCommandEvent.command);
  };

  var _inj

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self = {

    // function to retun an array of all the currently open tabs
    getAllTabs: function () {
      var _allTabs = [];
      for(var i = 0; i < safari.application.browserWindows.length; i++) {
        var currentWindow = safari.application.browserWindows[i];
        for(var j=0; j < currentWindow.tabs.length; j++) {
          var tab = currentWindow.tabs[j];
          _allTabs.push(tab);
        }
      }
      return _allTabs;
    },

    getActiveTab: function () {
      return safari.application.activeBrowserWindow.activeTab;
    },

    // send a message to a specific tab, from the collection above
    sendMessageToTab: function(tab, message, data) {
      tab.page.dispatchMessage(message, data);
    },

    // the adapter listener for messages
    addInjectedMessageListener: function(functionToCall) {
      _injectedMessageListenerFunction = functionToCall;
      safari.self.addEventListener("message", _injectedRespondToMessage, false);
    },

    // assign the command passed to our variable to call later
    // register the command listener
    addBackgroundCommandListener: function(functionToCall) {
      _backgroundCommandListenerFunction = functionToCall;
      safari.application.addEventListener("command", _backgroundRespondToCommand, false);
    }
  };

  return self;

}.call();



