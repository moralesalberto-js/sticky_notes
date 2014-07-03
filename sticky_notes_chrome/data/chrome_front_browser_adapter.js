// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var front_adapter = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessagesListenerFunction;

  // we receive the event in Chrome way
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
      chrome.runtime.sendMessage({name: message, data: data});
    },

    // the adapter listener for messages
    // (This function is called once by page)
    // functiontoCall(message_name, message_data)
    addInjectedMessagesListener: function(functionToCall) {
      _injectedMessagesListenerFunction = functionToCall;
      chrome.runtime.onMessage.addListener(_injectedRespondToMessages);
    },

    // This is the URL to access files that are in the extension directory
    // It is used to access the haml templates for example.
    getLocalUrlFor: function(relative_path) {
      return chrome.extension.getURL(relative_path);
    },
  };

  return self_;

}.call();



