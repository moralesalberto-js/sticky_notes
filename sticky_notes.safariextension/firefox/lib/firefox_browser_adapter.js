// This is the adapater object that will wrap all the safari specific calls
// Use the same interface for the other browsers

//Listing of the CommmonJS modules that we have to load here
//Because Firefox does not do it the way the other do :(
//see https://github.com/epeli/underscore.string#nodejs-installation
var _ = require("./shared/lib/underscore");
_.str = require("./shared/lib/underscore.string");
_.mixin(_.str.exports());

var background = require("./shared/background").background;

//Listing of the APIS needed in the extension
var PageModifier = require("sdk/page-mod");
var {ActionButton} = require('sdk/ui/button/action');
var ExtensionSelf = require('sdk/self');
var ss = require("sdk/simple-storage");

exports.browser = function () {

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

  var _commandsAdapter = function(){

    //This sets up the button and the command event linked with it
    var _setupButton = function(){

      //function linked to the click event
      function buttonClicked() {
        require("./shared/background").background.showStickyPad();
      }

      //Set up the addon button the function called on click event
      ActionButton({
        id: "bublupButton",
        label: "Open Bublup !",
        icon: "./shared/images/icon.png",
        onClick: buttonClicked
      });

    };

    var self_ = {
      setupAll : function(){
        _setupButton();
      }
    };

    return self_;

  }.call();


  //Scripts set up adapter
  //Firefox sets up scripts with a function and not with manifest declarations
  //This is also where we have to inject the messaging logic
  //This is also where to inject style that uses relative path functions
  var _scriptsAdapter = function() {
    var _workersArray =[];
    var _setupMessaging = function(worker){
      //we attach all the background rules to all workers
      worker.port.on('background', function(message) {
        message_name=message.name;
        message_data=message.data;
        //Here are the rules declarations
        //WE WANT THEM TO BE IN SHARED
        if(message_name === 'saveNoteContent') {
          browser.saveToLocalStorage({key: 'note_content', value: message_data.content});
        }
      });
    };
  //This injects the script in all regular content that gets loaded in the browser
    var _injectScriptInAllUrls = function() {

      function _detachWorker(worker, workerArray) {
        var index = workerArray.indexOf(worker);
        if(index != -1) {
          workerArray.splice(index, 1);
        }
      }

      PageModifier.PageMod({
        include: '*',
        contentScriptFile: [
          ExtensionSelf.data.url("shared/lib/jquery-1.11.1.js"),
          ExtensionSelf.data.url("shared/lib/underscore.js"),
          ExtensionSelf.data.url("shared/lib/underscore.string.js"),
          ExtensionSelf.data.url("shared/lib/backbone.js"),
          ExtensionSelf.data.url("shared/lib/haml.js"),
          ExtensionSelf.data.url("firefox_browser_adapter.js"),
          ExtensionSelf.data.url("shared/js/injected.js")
        ],
        contentStyleFile: ExtensionSelf.data.url("shared/css/styles.css"),
        contentStyle: [
          // !!!!! Here we can add url('') path that will get included in every page
          // ".existing { background-image: url(" + ExtensionSelf.data.url("bublup-icon.png") + ")}",
        ],
        attachTo: ["existing", "top"],
        onAttach: function(worker) {
          _workersArray.push(worker);
          console.log("workeer injected in" + worker.tab.title);
          // !!!!! Here we have access to the page worker, and can attach it the messaging rules
          // !!!!! Or we can put it in an array to retrieve it later ( But arrays of worker are a pain !)
          _setupMessaging(worker);

          //Cleaning the worker array
          worker.on('detach', function () {
            _detachWorker(this, _workersArray);
          });
        }
      });
    };


    var self_ = {
      getWorker : function(tab){
        var res=null;
        var i=0;
        console.log("Workers array of size : "+_workersArray.length);
        for (var wor in _workersArray){
          console.log("Worker"+wor.id + "   Title ");
          if (wor.tab !==undefined){
            console.log("title:"+wor.tab.title);
          }
        }
        while(res===null && i<_workersArray.length){
          if(_workersArray[i].tab!==null && _workersArray[i].tab.id===tab.id){
            res=_workersArray[i];
          }
          i++;
        }
        return res;
      },
      setupAll : function(){
        _injectScriptInAllUrls();
      }
    };

    return self_;
  }.call();

  // PUBLIC API
  // if you change any of these functions, you need to visit the implementation for all
  // browsers and add your changes there as well
  var self_ = {

    //function to setup scripts and messaging, stub in safari and chrome
    setUpScripts : function (){
      _commandsAdapter.setupAll();
      _scriptsAdapter.setupAll();
    },

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
      tabWorker = _scriptsAdapter.getWorker(tab);
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
      return ExtensionSelf.data.url(relative_path);
      // return chrome.extension.getURL(relative_path);
    },

    // LOCAL STORAGE
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
// !!!!!!! The specific and better chrome storage is Asynchronous
// ??????? firefox storage uses an API
    saveToLocalStorage: function(data) {
      ss.storage.data.key= data.value;
      // localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return ss.storage.key;
    }
  };

  return self_;

}.call();



