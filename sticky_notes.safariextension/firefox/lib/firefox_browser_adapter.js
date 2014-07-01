// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var browser = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessagesListenerFunction;
  var _backgroundCommandsListenerFunction;
  var _backgroundMessagesListenerFunction;

  // we receive the event in Safari native signature
  // we translate it to the two variables in the shared interface
  // _function(message_name, message_data)
  var _injectedRespondToMessages = function(theMessageEvent) {
    _injectedMessagesListenerFunction(theMessageEvent.name, theMessageEvent.message);
  };

  // this receives the command (click of toolbar) by Safari
  // sends it translated to the signature of the generic response to command
  // _function(command_name)
  var _backgroundRespondToCommands = function(theCommandEvent) {
    _backgroundCommandsListenerFunction(theCommandEvent.command);
  };

  // this function receives the messages from the injected script
  var _backgroundRespondToMessages = function(theMessageEvent){
    var message_name = theMessageEvent.name;
    var message_data = theMessageEvent.message;
    _backgroundMessagesListenerFunction(message_name, message_data);
  };


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

    // send a message to a specific tab
    sendMessageToTab: function(tab, message, data) {
      tab.page.dispatchMessage(message, data);
    },

    // send a message from injected script to background js
    sendMessageToBackground: function(message, data) {
      safari.self.tab.dispatchMessage(message, data);
    },

    // the adapter listener for messages
    addInjectedMessagesListener: function(functionToCall) {
      _injectedMessagesListenerFunction = functionToCall;
      safari.self.addEventListener("message", _injectedRespondToMessages, false);
    },

    // assign the command passed to our variable to call later
    // register the command listener
    addBackgroundCommandsListener: function(functionToCall) {
      _backgroundCommandsListenerFunction = functionToCall;
      safari.application.addEventListener("command", _backgroundRespondToCommands, false);
    },

    // similar to commands, assign the function to call
    // to a variable so that we can call it after we receive the message
    // and translate it to the generic form
    addBackgroundMessagesListener: function(functionToCall) {
      _backgroundMessagesListenerFunction = functionToCall;
      safari.application.addEventListener("message", _backgroundRespondToMessages, false);
    },

    // This is the URL to access files that are in the extension directory
    // It is used to access the haml templates for example.
    getLocalUrlFor: function(relative_path) {
      return (safari.extension.baseURI + relative_path);
    },

    // LOCAL STORAGE
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
    saveToLocalStorage: function(data) {
      localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return localStorage[key];
    }
  };

  return self;

}.call();



