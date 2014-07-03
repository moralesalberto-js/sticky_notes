// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var background_adapter = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _backgroundCommandsListenerFunction;
  var _backgroundMessagesListenerFunction;


  // this receives the command (click of toolbar) by Safari
  // sends it translated to the signature of the generic response to command
  // _function(command_name)
  var _backgroundRespondToCommands = function(theCommandEvent) {
    _backgroundCommandsListenerFunction(theCommandEvent.name);
  };

  // this function receives the messages from the injected script
  var _backgroundRespondToMessages = function(theMessageEvent){
    var message_name = theMessageEvent.name;
    var message_data = theMessageEvent.data;
    _backgroundMessagesListenerFunction(message_name, message_data);
  };


  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self_ = {

    // function to retun an array of all the currently open tabs

// !!!!!! Callback in chrome
  //Callback function([tabs])
    getAllTabs: function (callback) {
      chrome.tabs.query({},callback);
    },

// !!!!!! Callback in chrome
    //callback : function(tab)
    getActiveTab: function (callback) {
      chrome.tabs.query({lastFocusedWindow : true, active: true},function(tabs){
        console.log(tabs);
        callback(tabs[0]);
      });
    },

    // send a message to a specific tab
    sendMessageToTab: function(tab, message, data) {
      chrome.tabs.sendMessage(tab.id, {name: message, data: data});
    },

    // the adapter listener for messages
    // (This function is called once by page)
    // functiontoCall(message_name, message_data)
    addInjectedMessagesListener: function(functionToCall) {
      _injectedMessagesListenerFunction = functionToCall;
      chrome.runtime.onMessage.addListener(_injectedRespondToMessages);
    },

    // assign the command passed to our variable to call later
    // register the command listener
    // functionToCall (message_name, message_data)
// !!!!!! Not same distinction in chrome, check global.js
    addBackgroundCommandsListener: function(functionToCall) {
      _backgroundCommandsListenerFunction = functionToCall;
      chrome.runtime.onMessage.addListener(_backgroundRespondToCommands);
    },

    // similar to commands, assign the function to call
    // to a variable so that we can call it after we receive the message
    // and translate it to the generic form
    addBackgroundMessagesListener: function(functionToCall) {
      _backgroundMessagesListenerFunction = functionToCall;
      chrome.runtime.onMessage.addListener(_backgroundRespondToMessages);
    },

    // This is the URL to access files that are in the extension directory
    // It is used to access the haml templates for example.
    getLocalUrlFor: function(relative_path) {
      return chrome.extension.getURL(relative_path);
    },

    // LOCAL STORAGE
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
// !!!!!!! The specific and better chrome storage is Asynchronous
    saveToLocalStorage: function(data) {
      localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return localStorage[key];
    }
  };

  return self_;

}.call();



