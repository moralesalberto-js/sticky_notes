// This is the main background script that will run in the Safari extension
// The script runs once, every time Safari is started.



// Using require.js to ensure dependencies are loaded in order
// Register the modules to use here
require.config({

  paths: {
    'jquery': '../shared/lib/jquery-1.11.1',
    'underscore': '../shared/lib/underscore',
    'underscore-string': '../shared/lib/underscore.string',
    'haml': '../shared/lib/haml',
    'background': 'background'
  },

  shim: {
    'underscore': {
      exports: '_'
    },

    'underscore-string': {
      deps: ['underscore'],
      exports: '_s'
    },

    'haml': {
      deps: ['underscore', 'underscore-string'],
      exports: 'haml'
    }

  }

});


// Here you tell require.js the order the modules are loaded
// and which variable points to the module
define(['jquery', 'background', 'haml'], function ($, background, haml) {

  // Here we finally run the code for main.js
  background.setupListeners();


});
