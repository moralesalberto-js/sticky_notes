// This is the background object that will:
// (1) maintain the state of this extension while Safari is running
// (2) handle the messaging between the background process and the injected scripts

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
        console.log("sending the message to injected");
        background_adapter.sendMessageToTab(_tab, 'showStickyPad', _data);
      });
    };


    // this function gets the html from the haml template
    // and whatever variables need to be filled in the template
    var _getHtmlForView = function () {
      var _templateUrl = background_adapter.getLocalUrlFor("data/shared/templates/sticky_pad.html.haml");
      var _template = haml.compileHaml( { sourceUrl: _templateUrl } );

      // get the note saved in local storage
      // if there is none, then just return a default string
      var _note_content = background_adapter.getDataFromLocalStorageForKey('note_content') || 'Enter you notes here ...';
      var _vars = {content: _note_content};
      var _compiledHtml = _template(_vars);
      console.log("Haml"+_compiledHtml);
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
      console.log("Button clicked");
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


