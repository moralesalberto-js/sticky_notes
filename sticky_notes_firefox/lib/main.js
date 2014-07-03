// This is the main background script that will run in the Firefox extension
// The script runs once, every time Firefox is started.

//Listing of the CommmonJS modules that we have to load here
//Because Firefox does not do it the way the other do :(
//see https://github.com/epeli/underscore.string#nodejs-installation
var _ = require("./shared/lib/underscore");
_.str = require("./shared/lib/underscore.string");
_.mixin(_.str.exports());

var background = require("./shared/background").background;
var background_adapter = require("./firefox_background_browser_adapter").background_adapter;

// !!!! Cannot use Jquery in this page in firefox (logic because there is no DOM)
// So no $.on(ready)
  background_adapter.setUpScripts();

  // Hard to adapt
  // background.setupListeners();
  // Maybe : background.setupScriptsAndMessagingRules(message rules, command rules);
  // Who will then call browser.setupScriptsAndMessaging

