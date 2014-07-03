

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

      // render will paint the view
      // pass it a data object with the html to display
      render: function (data) {
        this.$el.html(data.html); // the DOM is replaced with new html
        this.delegateEvents();// bind all events to the new html
      },

      events: {
        'click #sticky_pad_close' : 'closeStickyPad',
        // commented the line below in favor of input, that saves
        // as each character is typed, change only registers when
        // the element loses focus
        // 'change #sticky_pad_textarea' : 'saveNoteContent'
        'input #sticky_pad_textarea' : 'saveNoteContent'
      },

      closeStickyPad : function () {
        stickyPad.hide();
      },

      saveNoteContent: function(event) {
        var _field = $(event.currentTarget);
        var _newValue = _field.val();
        front_adapter.sendMessageToBackground("saveNoteContent", {content: _newValue});
      }

    });

    // PUBLIC API for stickyPad
    var _self = {

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

    return _self;
  }.call();


  var messaging = function () {

    // This is the shared interface to receive a message, it has two variables
    // the message name, and the message_data
    // In the front_adapter adapter you set the translation
    var _respondToMessage = function (message_name, message_data) {

      if (message_name === 'showStickyPad') {
        stickyPad.show(message_data);
      }

      if (message_name === 'hideStickyPad') {
        stickyPad.hide();
      }
    };


    var _self = {
      setupListener: function () {
        // front_adapter is the adapter object that has a common signature for all front_adapters
        // if you add or modify front_adapter, you need to do the same for all three front_adapter adapters
        front_adapter.addInjectedMessagesListener(_respondToMessage);
      }
    };

    return _self;
  }.call();



  $(document).ready(function () {
    console.log("Script injected");
    stickyPad.initialize();
    messaging.setupListener();
  });
}

