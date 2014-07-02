// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

var browser = function () {
  // this is the var that will hold the function the extension registered
  // as the function to listen for injected scripts
  var _injectedMessagesListenerFunction;
  var _backgroundCommandsListenerFunction;
  var _backgroundMessagesListenerFunction;

  // ????We do not receive events in Firefox way
  // we translate it to the two variables in the shared interface
  // _function(message_name, message_data)
  var _injectedRespondToMessages = function(theMessageEvent) {
    _injectedMessagesListenerFunction(theMessageEvent.name, theMessageEvent.data);
  };

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

  var _getWorker = function(tab){

  };

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var _self = {

    // function to retun an array of all the currently open tabs
// !!!!!! Callback in chrome
// ?????? Different levels of Tab object in firefox API This is High level
    getAllTabs: function () {
      var _allTabs = require("sdk/tabs");
      return _allTabs;
    },

// !!!!!! Callback in chrome
// ?????? Different levels of Tab object in firefox API This is High level
    getActiveTab: function () {
      var _allTabs = require("sdk/tabs");
      return _allTabs.activeTab;
    },

    // send a message to a specific tab
// ?????? Not same way in firefox, send message to a worker
// ?????? Need of another function
    sendMessageToTab: function(tab, message, data) {
      tabWorker = _getWorker(tab);
      tabWorker.port.emit("tab",{name:message, data: data});
    },

    // send a message from injected script to background js
// ?????? Not same way in firefox, send message to a worker
// But this side of communication is ok
    sendMessageToBackground: function(message, data) {
      self.port.emit("background",{name:message, data:data});
    },

    // the adapter listener for messages
    // (This function is called once by page)
    // functiontoCall(message_name, message_data)
// ?????? Trick to bypass the atomic way of firefox

    // addInjectedMessagesSingleListenerFirefox: function (message, functionToCall){
    //   self.port.on("tab",functionToCall);
    // },
    // addInjectedMessagesListener: function(hash_message_functions){
    //   for (var message_functions in hash_message_functions){
    //     addInjectedMessagesSingleListenerFirefox(messages_functions.message, messages_functions.functionToCall);
    //   }
    // },
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

    // addBackgroundCommandsSingleListenerFirefox: function(message, functionToCall){
    //   self.port.on(message,functionToCall);
    // },
    // addBackgroundCommandsListener: function(hash_commands_functions) {
    //   for (var commands_functions in hash_commands_functions){
    //     addInjectedMessagesSingleListenerFirefox(commands_functions.message, commands_functions.functionToCall);
    //   }
    // },
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

    // LOCAL STORAGE
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
// !!!!!!! The specific and better chrome storage is Asynchronous
// ??????? firefox storage uses an API
    saveToLocalStorage: function(data) {
      // var ss = require("sdk/simple-storage");
      // ss.storage.data.key= data.value; ???
      localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return localStorage[key];
    }
  };

  return _self;

}.call();
