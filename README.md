Classic New Tab Page for Chrome
==============

Build
-----
Classic New Tab Page for Chrome is using the build system [Ant](http://ant.apache.org/).

### Base requirements
 * Computer
 * [Java SDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
 * [Ant](http://ant.apache.org/)

### Optional requirements
To build the Chrome extension it is required to be able to run executable, which can be done in Wine on Linux or on a Windows computer.

It is possible to build the unpacked version of the Chrome extension without the need to run executables:
 * `ant copy-chrome` -- Makes the required files to build the extension file (.crx) ready in the build directory.

### Signing
The certificate for signing the extensions have to be provided by yourself and have to be placed in:
 * `/.cert/chrome/`

It should be noted that the ant build will create a new signing key for Chrome if it's missing from `/.cert/chrome/` (Running executables is required).

### Ant
The build system is made in ant and require ant and java to be installed.

 * `ant all` -- Cleans and builds the packaged Chrome extension (.crx).
 * `ant devnumber` -- Increment the build number.
 * `ant chrome` -- Build the packaged Chrome extension (.crx).
 * `ant dev` -- Build the Chrome extension as a folder for development.

### Build Properties (build.properties)
The keys in this file have the prefix and suffix `@`.

 * `devbuild` -- Set to true if you want to create a developer build and false if it's a stable release.
 * `ant-version` -- The stable version.
 * `name-stable` -- The name of the extensions for the stable version.
 * `name-dev` -- The name of the extensions for the developer version.
 * `chrome-id` -- The id of the Chrome extension. The id can be found in `chrome://extensions/` or calculated from the signing key.
 * `chrome-update-xml` -- The location of the file, which Chrome uses to check if a new version of the developer version of Classic New Tab Page for Chrome is available.
 * `chrome-update-file` -- The location of the newest version of the developer version of Classic New Tab Page for Chrome is located.

License
-------
The MIT License (MIT)

Copyright (c) 2014 Everette Beatley

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.