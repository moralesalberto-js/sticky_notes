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

var background_adapter = function () {

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

    //This array register the workers linked to injected scripts
    //so they can be accessed later
    var _workersArray =[];

    //This implements the messaging rules for the background script to the workers
    var _setupMessaging = function(worker){
      //we attach all the background rules to all workers
      worker.port.on('background', function(message) {
        message_name=message.name;
        message_data=message.data;
        //Here are the rules declarations
        //!!!!!! WE WANT THEM TO BE IN SHARED
        if(message_name === 'saveNoteContent') {
          background_adapter.saveToLocalStorage({key: 'note_content', value: message_data.content});
        }
      });
    };

    //Cleans the worker array when a tab is destroyed
    var _detachWorker = function (worker, workersArray) {
      var index = workersArray.indexOf(worker);
      if(index != -1) {
        workersArray.splice(index, 1);
      }
    };

    //Keeps only the last worker for each tab upon insertion in the array
    // !!!! BUG : When you go Back you loose the worker this way !!!
    var _insertWorker = function(worker, workersArray){
      var n = workersArray.length;
      var i= 0;
        while (i<n) {
        if (workersArray[i].tab.url===worker.tab.url){
          workersArray.splice(i, 1);
          n--;
        }
        i++;
      }
      workersArray.push(worker);
    };

    //This injects the script in all regular content that gets loaded in the browser
    var _injectScriptInAllUrls = function() {

      //Includes content scripts and stylesheets in matching '*' pages
      //Only access to the worker object which register the messaging rules
      PageModifier.PageMod({
        include: '*',
        contentScriptFile: [
          ExtensionSelf.data.url("shared/lib/jquery-1.11.1.js"),
          ExtensionSelf.data.url("shared/lib/underscore.js"),
          ExtensionSelf.data.url("shared/lib/underscore.string.js"),
          ExtensionSelf.data.url("shared/lib/backbone.js"),
          ExtensionSelf.data.url("shared/lib/haml.js"),
          ExtensionSelf.data.url("firefox_front_browser_adapter.js"),
          ExtensionSelf.data.url("shared/js/injected.js")
        ],
        contentStyleFile: ExtensionSelf.data.url("shared/css/styles.css"),
        contentStyle: [
          // !!!!! Here we can add url('') paths that will get included in every page
          // For example :
          // ".existing { background-image: url(" + ExtensionSelf.data.url("bublup-icon.png") + ")}",
        ],
        //Do not include the script in iframes
        attachTo: ["existing", "top"],
        onAttach: function(worker) {
          //A worker is the link between background script and the content script
          //that was just loaded
          //See the Firefox SDK documentation
          _insertWorker(worker,_workersArray);
          _setupMessaging(worker);
          //Cleaning the worker array when the relative tab is deleted
          worker.on('detach', function () {
            _detachWorker(this, _workersArray);
          });
        }
      });
    };


    var self_ = {
      //This is to retrieve worker from the Array
      getWorker : function(tab){
        var res=null;
        var i=0;
        while(i<_workersArray.length){
          if(_workersArray[i].tab!==undefined && _workersArray[i].tab.url===tab.url){
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
    // callback = function([tabs])
    getAllTabs: function (callback) {
      console.log("get tabs called");
      var _allTabs = require("sdk/tabs");
      callback(_allTabs);
    },

    // callback = function(tab)
    getActiveTab: function (callback) {
      var _allTabs = require("sdk/tabs");
      callback(_allTabs.activeTab);
    },

    // send a message to a specific tab
    sendMessageToTab: function(tab, message, data) {
      tabWorker = _scriptsAdapter.getWorker(tab);
      tabWorker.port.emit("tab",{name:message, data: data});
    },

    // assign the command passed to our variable to call later
    // register the command listener
    // functionToCall (message_name, message_data)
    //Not useful

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
    // NOT ACCESSIBLE FROM CONTENT SCRIPT IN FIREFOX
    getLocalUrlFor: function(relative_path) {
      return ExtensionSelf.data.url(relative_path);
    },

    // LOCAL STORAGE
    // local storage works with simple key, value stores
    // For this exercise we are only saving a single note
    // We can add pagination later on to have multiple notes
    // !!!!! ONLY FROM BACKGROUND FIREFOX ss is an api required at the top
    saveToLocalStorage: function(data) {
      eval("ss.storage."+data.key+"= data.value");
      // localStorage[data.key] = data.value;
    },

    getDataFromLocalStorageForKey: function(key) {
      return eval("ss.storage."+key);
    }
  };

  return self_;

}.call();

exports.background_adapter=background_adapter;

