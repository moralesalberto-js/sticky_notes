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
  var self_ = {

    // function to retun an array of all the currently open tabs
    //calllback must be a function([tabs])
    getAllTabs: function (callback) {
      var _allTabs = [];
      for(var i = 0; i < safari.application.browserWindows.length; i++) {
        var currentWindow = safari.application.browserWindows[i];
        for(var j=0; j < currentWindow.tabs.length; j++) {
          var tab = currentWindow.tabs[j];
          _allTabs.push(tab);
        }
      }
      callback(_allTabs);
    },

    //callback must be a function(tab)
    getActiveTab: function (callback) {
      callback(safari.application.activeBrowserWindow.activeTab);
    },

    // send a message to a specific tab
    sendMessageToTab: function(tab, message, data) {
      tab.page.dispatchMessage(message, data);
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
      console.log("adding bckground rules");
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

  return self_;

}.call();



