FABridgeC
=========

FABridgeC is a [Closure Compiler](http://code.google.com/closure/compiler/)
compatible version of Adobe's
[Flex Ajax Bridge](http://livedocs.adobe.com/flex/3/html/ajaxbridge_1.html)
JavaScript code, also known as FABridge.

It's still a bit of a work in progress, but it should be usable as a drop-in
replacement for FABridge in nearly all cases (see below for details). FABridgeC
is available under the terms of the MIT license, just like the original
FABridge JavaScript.

The upshot? An FABridge replacement that's just 5.4 KiB compiled, or 2.0 KiB
gzipped.

Drop-in Replacement
-------------------

You can use the compiled [fabridgec.js](https://github.com/aschmitz/fabridgec/blob/master/fabridgec.js)
in place of `fabridge.js` pretty much anywhere. Go ahead and try it out on your
website, and save 10+ KiB every fresh page load. Unless you're really into
optimizing things, that's all it takes.

The two cases in which it *won't* work:

1. If you use the low-level API of FABridge: (These functions aren't exported
   by default, but you can export them manually if you want.)
   - `getPropertyFromAS(objRef, propName)`
   - `setPropertyInAS(objRef,propName, value)`
   - `callASFunction(funcID, args)`
   - `callASMethod(objID, funcName, args)`
2. If you have Flash objects with bridge names of a single character. (They may
   conflict with the Closure-generated internal method names.)

It should work in pretty much every other case. FABridgeC doesn't pollute the
global namespace.

If you want to recompile FABridgeC, the `compile.sh` script with FABridgeC uses
[Plovr](http://plovr.com) to ease running the Closure Compiler. Running the
compiler manually should work as well, just don't forget to include
`externs/fabridge.js`. The provided compilation script also processes the
output JavaScript file with `gzip` and
[AdvanceCOMP](http://advancemame.sourceforge.net/comp-readme.html) to squeeze
the last few bytes out of the file. If you can't serve pre-compressed files,
don't worry about `fabridgec.js.gz`, as the default zlib settings produce a
file which is only a few bytes larger than the provided version. (You are 
[compressing your scripts](http://developer.yahoo.com/blogs/ydn/posts/2007/07/high_performanc_3/)
at least, right?)

Use with Closure
----------------

If you use the Closure Compiler for your own code, you can use
`goog.require('vendor.FABridgeC')` to include FABridgeC. Use `vendor.FABridgeC`
in place of `FABridge` in your code, and everything should work as expected.

Note that no `FABridge` object will be exported to the global namespace, so use
`goog.require('vendor.FABridgeC.exports')` if you want FABridge to be exported
in addition to using it in your code.

The code in FABridgeC is currently based extremely heavily on the code provided
by Adobe in the FABridge JavaScript file, and although a few changes have been
made to the formatting, the vast majority has stayed the same. Therefore, much
of the code is not in the [Google JavaScript style](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).

Contact
-------

If you have questions or notice a problem, feel free to send me a message via
GitHub (I'm aschmitz), or find me on [my website](http://lardbucket.org) and
say hello.
