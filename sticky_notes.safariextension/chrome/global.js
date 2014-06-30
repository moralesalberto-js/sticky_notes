// This is the main background script that will run in the Chrome extension
// The script runs once, every time Chrome is started.

$(document).ready(function () {

  //Commands set up adapter.
  //Some browser set up commands in their manifest, some in scripts
  var commandsAdapter = function(){

    //This sets up the button and the command event linked with it
    var _setupButton = function(){
      chrome.browserAction.onClicked.addListener(
        chrome.extension.runtime.sendMessage({name:"showStickyPad", data: ""})
      );
    };

    var self = {
      setupAll : function(){
        _setupButton();
      }
    };

  }.call();

  commandsAdapter.setupAll();
  background.setupListeners();

});

