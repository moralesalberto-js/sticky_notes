// This is the main background script that will run in the Safari extension
// The script runs once, every time Safari is started.



// Using require.js to ensure dependencies are loaded in order
// Register the modules to use here
require.config({
  paths: {
  // the left side is the module ID,
  // the right side is the path to
  // the jQuery file, relative to baseUrl.
  // Also, the path should NOT include
  // the '.js' file extension. This example
  // is using jQuery 1.11.1 located at
  // ../shared/lib/jquery-1.11.1.js, relative to
  // the HTML page.
    jquery: '../shared/lib/jquery-1.11.1',
    background: 'background'
  }
});


// Here you tell require.js the order the modules are loaded
// and which variable points to the module
define(['jquery', 'background'], function ($, background) {

  // Here we finally run the code for main.js
  background.setupListeners();

});
