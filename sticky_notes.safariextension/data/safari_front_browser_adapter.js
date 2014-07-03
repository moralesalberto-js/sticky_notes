// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var front_adapter = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessagesListenerFunction;

  // we receive the event in Safari native signature
  // we translate it to the two variables in the shared interface
  // _function(message_name, message_data)
  var _injectedRespondToMessages = function(theMessageEvent) {
    _injectedMessagesListenerFunction(theMessageEvent.name, theMessageEvent.message);
  };

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self_ = {

    // send a message from injected script to background js
    sendMessageToBackground: function(message, data) {
      safari.self.tab.dispatchMessage(message, data);
    },

    // the adapter listener for messages
    addInjectedMessagesListener: function(functionToCall) {
      _injectedMessagesListenerFunction = functionToCall;
      safari.self.addEventListener("message", _injectedRespondToMessages, false);
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

  return self_;

}.call();



