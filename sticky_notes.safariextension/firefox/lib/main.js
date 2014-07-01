// This is the main background script that will run in the Firefox extension
// The script runs once, every time Firefox is started.


//Listing of the CommmonJS modules that we have to load here
//Because Firefox does not do it the way the other do :(
//see https://github.com/epeli/underscore.string#nodejs-installation
var _ = require("./shared/lib/underscore");
_.str = require("./shared/lib/underscore.string");
_.mixin(_.str.exports());

//Listing of the APIS needed in the extension
var PageModifier = require("sdk/page-mod");
var {ActionButton} = require('sdk/ui/button/action');
var ExtensionSelf = require('sdk/self');

  //Commands set up adapter.
  //Some browser set up commands  in their manifest, some in scripts
  var commandsAdapter = function(){

    //This sets up the button and the command event linked with it
    var _setupButton = function(){

      //function linked to the click event
      function buttonClicked() {
        function (tab){
          // !!! chrome.runtime.sendMessage({name:"showStickyPad", data: ""});
        }
      }

      //Set up the addon button the function called on click event
      ActionButton({
        id: "bublupButton",
        label: "Open Bublup !",
        icon: "./shared/images/icon.png",
        onClick: buttonClicked
      });

    };

    var self = {
      setupAll : function(){
        _setupButton();
      }
    };

    return self;

  }.call();


  //Scripts set up adapter
  //Firefox sets up scripts with a function and with manifest declarations
  var scriptsAdapter = function() {

  //This injects the script in all regular content that gets loaded in the browser
    var _injectScriptInAllUrls = function() {
      PageModifier.PageMod({
        include: '*',
        contentScriptFile: [
          ExtensionSelf.data.url("shared/lib/jquery-1.11.1.js"),
          ExtensionSelf.data.url("shared/lib/backbone.js"),
          ExtensionSelf.data.url("shared/lib/haml.js"),
          ExtensionSelf.data.url("/shared/js/injected.js"),
        ],
        contentStyleFile: ExtensionSelf.data.url("styles.css"),
        contentStyle: [
          ".existing { background-image: url(" + ExtensionSelf.data.url("bublup-icon.png") + ")}",
          ".filtered { background-image: url(" + ExtensionSelf.data.url("blacklist-icon.png") + ")}"
        ],
        attachTo: ["existing", "top"],
        onAttach: function(worker) {
          _setupMessaging(worker);
        }
      });
    };


    var self = {

      setupAll : function(){
        _injectScriptInAllUrls();
      }

    };

    return self;
  }.call();

// !!!! Cannot use Jquery in this page in firefox (logic because there is no DOM)

  console.log(_.levenshtein('kitten', 'kittah'));
  commandsAdapter.setupAll();
  scriptsAdapter.setupAll();
  background.setupListeners();

