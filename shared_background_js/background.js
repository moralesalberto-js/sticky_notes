// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

var browser = require("../firefox_browser_adapter").browser;

var haml = require("./lib/haml");

exports.background = function () {

  // This is the object that represents the stickyPad in the backround process
  var _stickyPad = function () {

    // send a message to all the windows and tabs to close the sticky notepad
    var _hideInAllTabs = function () {
      var _tabs = browser.getAllTabs();
      for(var i = 0; i < _tabs.length; i++) {
        var _tab = _tabs[i];
        browser.sendMessageToTab(_tab, 'hideStickyPad', 'hideStickyPad');
      }
    };

    // send a message to show the sticky pad with the html for the view
    var _showInActiveTab = function () {
      var _tab = browser.getActiveTab();
      var _data = { html: _getHtmlForView() };
      // we send a message to the injected script with the html
      // to paint the view
      browser.sendMessageToTab(_tab, 'showStickyPad', _data);
    };


    // this function gets the html from the haml template
    // and whatever variables need to be filled in the template
    var _getHtmlForView = function () {
      var _templateUrl = browser.getLocalUrlFor("shared/templates/sticky_pad.html.haml");
      console.log(_templateUrl);
      var string = "%textarea Hellooooo";
      // var _template = hamlmodule.compileHaml( { sourceUrl: _templateUrl } );
      // var _template = haml.compileHaml({source :string});
      // console.log(_template);
      // get the note saved in local storage
      // if there is none, then just return a default string
      var _note_content = browser.getDataFromLocalStorageForKey('note_content') || 'Enter you notes here ...';
      var _vars = {content: _note_content};
      // console.log(_vars);
      // console.log(_template);
      // var _compiledHtml = _template();
      // var _compiledHtml = haml.compileHaml({source :string}).call(_vars);
      string = _vars.content;
      // return _compiledHtml;
      return "<div id='sticky_pad_navbar'><a href='javascript:void(0)', id='sticky_pad_close'>Close (X)</a></div><br/><textarea id='sticky_pad_textarea'>"+string+"</textarea>";
    };


    var self_ = {
      show : function () {
        _hideInAllTabs();
        _showInActiveTab();
      }
    };

    return self_;
  }.call();



  var _handleCommands = function (command_name) {
    if(command_name === 'showStickyPad') {
      _stickyPad.show();
    }
  };

  var _setupCommandsListener = function() {
    browser.addBackgroundCommandsListener(_handleCommands);
  };


  var _handleMessages = function(message_name, message_data) {
    if(message_name === 'saveNoteContent') {
      browser.saveToLocalStorage({key: 'note_content', value: message_data.content});
    }
  };

  var _setupMessagesListener = function () {
    browser.addBackgroundMessagesListener(_handleMessages);
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


