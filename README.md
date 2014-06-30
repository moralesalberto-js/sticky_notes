sticky_notes
============

Sticky notes extension for the browser.

This extension will show a yellow sticky pad in the browser window. One can type notes and those get saved on the browser.

It makes use of:

1) Backbone.View
2) Haml js clientside

Was a proof of concept to see about leveraging HAML templates for the views.

This version works on Safari, but an adapter object has been created to allow for firefox and chrome extensions
to share the bulk of the code, the css and templates.

