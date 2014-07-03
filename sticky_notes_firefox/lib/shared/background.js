// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

//SHOULD HAD AN IF BROWSER = FIREFOX HERE
console.log("Houhou");
var background_adapter = require("../firefox_background_browser_adapter").background_adapter;

var haml = require("./lib/haml");

var background = function () {

  // This is the object that represents the stickyPad in the backround process
  var _stickyPad = function () {

    // send a message to all the windows and tabs to close the sticky notepad
    var _hideInAllTabs = function () {
      background_adapter.getAllTabs(function(_tabs){
        for(var i = 0; i < _tabs.length; i++) {
          var _tab = _tabs[i];
          background_adapter.sendMessageToTab(_tab, 'hideStickyPad', 'hideStickyPad');
        }
      });
    };

    // send a message to show the sticky pad with the html for the view
    var _showInActiveTab = function () {
      var _data = { html: _getHtmlForView() };
      // we send a message to the injected script with the html
      // to paint the view
      background_adapter.getActiveTab(function(_tab){
        background_adapter.sendMessageToTab(_tab, 'showStickyPad', _data);
      });
    };


    // this function gets the html from the haml template
    // and whatever variables need to be filled in the template
    var _getHtmlForView = function () {
        /* ALL THIS IS CURRENTLY NOT WORKING IN FIREFOX AND DIFFERS FROM THE OTHER BACKGROUND.JS =========
        var _templateUrl = background_adapter.getLocalUrlFor("shared/templates/sticky_pad.html.haml");
        var _template = haml.compileHaml( { sourceUrl: _templateUrl } );

        // get the note saved in local storage
        // if there is none, then just return a default string
        var _note_content = background_adapter.getDataFromLocalStorageForKey('note_content') || 'Enter you notes here ...';
        var _vars = {content: _note_content};
        var _compiledHtml = _template(_vars);
        ========================================================*/
      var _note_content = browser.getDataFromLocalStorageForKey('note_content') || 'Enter you notes here ...';
      var _vars = {content: _note_content};
      var _compiledHtml ="<div id='sticky_pad_navbar'><a href='javascript:void(0)', id='sticky_pad_close'>Close (X)</a></div><br/><textarea id='sticky_pad_textarea'>"+_vars.content+"</textarea>";
      return _compiledHtml;
    };


    var self = {
      show : function () {
        _hideInAllTabs();
        _showInActiveTab();
      }
    };

    return self;
  }.call();



  var _handleCommands = function (command_name) {
    if(command_name === 'showStickyPad') {
      _stickyPad.show();
    }
  };

  var _setupCommandsListener = function() {
    background_adapter.addBackgroundCommandsListener(_handleCommands);
  };


  var _handleMessages = function(message_name, message_data) {
    if(message_name === 'saveNoteContent') {
      background_adapter.saveToLocalStorage({key: 'note_content', value: message_data.content});
    }
  };

  var _setupMessagesListener = function () {
    background_adapter.addBackgroundMessagesListener(_handleMessages);
  };


  var self = {
    setupListeners : function () {
      _setupCommandsListener();
      _setupMessagesListener();
    },
    showStickyPad : function() {
      _stickyPad.show();
    }
  };

  return self;

}.call();

// IN FIREFOX ONLY
exports.background=background;
