

// only run this javascript if on top frame
if (window.top === window) {

  var stickyPad = function () {

    // this is the div id string that we will use
    var _stickyPadId = 'sticky_pad';
    var _stickyPad;

    var self = {

      // add the sticky pad to the DOM in the web page
      insert: function () {
        _stickyPad = document.createElement("div");
        document.body.insertBefore(_stickyPad, document.body.firstChild);
        _stickyPad.id = _stickyPadId;
      },

      show : function () {
        $(_stickyPad).show();
      },

      hide: function () {
        $(_stickyPad).hide();
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
        stickyPad.show();
      }

      if (message_name === 'hideStickyPad') {
        stickyPad.hide();
      }
    };


    var self = {
      setupListener: function () {
        browser.addInjectedMessageListener(_respondToMessage);
      }
    };

    return self;
  }.call();



  $(document).ready(function () {
    stickyPad.insert();
    messaging.setupListener();
  });
}

