

// only run this javascript if on top frame
if (window.top === window) {

  var stickyPad = function () {

    // this is the div id name
    var _stickyPadId = 'sticky_pad';
    var _stickyPadIdWithHash = '#' + _stickyPadId;

    // these are instantiated in the initialize function
    var _stickyPadDomElement; // the DOM element
    var _stickyPadView; // the BackboneView object

    // The StickyPadView is a Backbone View class
    var StickyPadView = Backbone.View.extend({
      el: _stickyPadIdWithHash,

        initialize: function () {
        },

        // render
        // this is the function that will paint the view
        // pass it a data object with the haml template to use and the vars to compile in the haml
        // Example:
        // render({ hamlTemplate: '%h1\n  = name', vars: {name: 'Alberto'}});
        render: function (data) {
          var _template = haml.compileHaml({source: data.hamlTemplate});
          var _compiledHtml = _template(data.vars);
          this.$el.html(_compiledHtml);
        }
    });

    // PUBLIC API for stickyPad
    var self = {

      // add the sticky pad to the DOM in the web page
      // set the Backbone View for stickyPad
      initialize: function () {
        _stickyPadDomElement = document.createElement("div");
        document.body.insertBefore(_stickyPadDomElement, document.body.firstChild);
        _stickyPadDomElement.id = _stickyPadId;
        _stickyPadView = new StickyPadView();
      },

      // show receives a data object with the hamlTemplate
      // and the vars to display, pass data object to _stickyPadView render function
      // the render function knows how to use that data object
      show : function (data) {
        _stickyPadView.render(data); // prepare the Backbone.View
        $(_stickyPadDomElement).show(); // unhide the DOM element
      },

      hide: function () {
        $(_stickyPadDomElement).hide();
      }
    };

    return self;
  }.call();


  var messaging = function () {

    // This is the shared interface to receive a message, it has two variables
    // the message name, and the message_data
    // In the browser adapter you set the translation
    var _respondToMessage = function (message_name, message_data) {

      if (message_name === 'showStickyPad') {
        stickyPad.show(message_data);
      }

      if (message_name === 'hideStickyPad') {
        stickyPad.hide();
      }
    };


    var self = {
      setupListener: function () {
        // browser is the adapter object that has a common signature for all browsers
        // if you add or modify browser, you need to do the same for all three browser adapters
        browser.addInjectedMessageListener(_respondToMessage);
      }
    };

    return self;
  }.call();



  $(document).ready(function () {
    stickyPad.initialize();
    messaging.setupListener();
  });
}

