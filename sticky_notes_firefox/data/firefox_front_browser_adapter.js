// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var front_adapter = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessagesListenerFunction;

  // we translate it to the two variables in the shared interface
  // _function(message_name, message_data)
  var _injectedRespondToMessages = function(theMessageEvent) {
    _injectedMessagesListenerFunction(theMessageEvent.name, theMessageEvent.data);
  };

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self_ = {

    // send a message from injected script to background js
    sendMessageToBackground: function(message, data) {
      self.port.emit("background",{name:message, data:data});
    },

    // the adapter listener for messages
    // (This function is called once by page)
    // functiontoCall(message_name, message_data)
    addInjectedMessagesListener: function(functionToCall) {
      _injectedMessagesListenerFunction = functionToCall;
      self.port.on("tab",_injectedRespondToMessages);
    },

    // assign the command passed to our variable to call later
    // register the command listener
    // functionToCall (message_name, message_data)
// !!!!!! Not same distinction in chrome, check global.js
// ?????? Not same distinction in firefox
// Can be done at only one time in firefox when scripts are set up, and
// only in a more atomic way
    addBackgroundCommandsListener: function(functionToCall) {
      _backgroundCommandsListenerFunction = functionToCall;
      self.port.on("command",_backgroundRespondToCommands);
    },

    // similar to commands, assign the function to call
    // to a variable so that we can call it after we receive the message
    // and translate it to the generic form
    addBackgroundMessagesListener: function(functionToCall) {
      _backgroundMessagesListenerFunction = functionToCall;
      self.port.on("background",_backgroundRespondToMessages);
    },

    // This is the URL to access files that are in the extension directory
    // It is used to access the haml templates for example.
    getLocalUrlFor: function(relative_path) {
      return self.data.url(relative_path);
      // return chrome.extension.getURL(relative_path);
    },

    // LOCAL STORAGE ! DO NOT USE IN FIREFOX
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
// !!!!!!! The specific and better chrome storage is Asynchronous
// ??????? firefox storage uses an API accessible only in the BACKGROUND
    saveToLocalStorage: function(data) {
      // var ss = require("sdk/simple-storage");
      // ss.storage.data.key= data.value; ???
      localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return localStorage[key];
    }
  };

  return self_;

}.call();
