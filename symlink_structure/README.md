Symlink Structure
============

This is a proposal of structure making atm use of symlink to sync the browsers "shared" folders with the top levels "shared_background_js, shared_locales, shared_data" folders.

It imposes everywhere firefox structure because :
1 - firefox requires it : data folder is required, lib/main.js is required (even the name should be main.js)
2 - the others allow complete freedom as long as the manifest file is modified accordingly
3 - this structure makes some sense : in lib are all the javascripts the background application requires, in data are all the data the background application will use at some point, by injecting it in the page or attach it to a button in the browser. ( this is not exactly a frontend only folder )
4 - this way relative urls in shared scripts will all be the same :-)

Folders : doc, locales, and test are just here to say " Hey this might be useful later".

This won't work without effective automatic synchronization of the folders at some point during the developement because symlinks are not followed during the build of extensions... Some bash scripts will be involved !

