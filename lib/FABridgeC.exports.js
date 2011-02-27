/**
 * @fileoverview Exports the human-readable properties for FABridgeC (to match
 * the main ones provided by FABridge). Note that they are exported under
 * FABridge, *not* FABridgeC, for compatibility with FABridge implementations.
 * 
 * @author Andy Schmitz (http://lardbucket.org)
 * 
 * FABridgeC is licensed under the MIT license:
 * 
 * Portions copyright 2006 Adobe Systems Incorporated
 * Copyright 2011 Andy Schmitz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

goog.require('vendor.FABridgeC');
goog.provide('vendor.FABridgeC.exports');

// We'll export these properties.
goog.exportProperty(vendor.FABridgeC, 'addInitializationCallback',
    vendor.FABridgeC.addInitializationCallback);
goog.exportProperty(vendor.FABridgeC.prototype, 'root',
    vendor.FABridgeC.prototype.root);
goog.exportProperty(vendor.FABridgeC.prototype, 'releaseASObjects',
    vendor.FABridgeC.prototype.releaseASObjects);
goog.exportProperty(vendor.FABridgeC.prototype, 'releaseNamedASObject',
    vendor.FABridgeC.prototype.releaseNamedASObject);
goog.exportProperty(vendor.FABridgeC.prototype, 'create',
    vendor.FABridgeC.prototype.create);
goog.exportProperty(vendor.FABridgeC.prototype, 'addRef',
    vendor.FABridgeC.prototype.addRef);
goog.exportProperty(vendor.FABridgeC.prototype, 'release',
    vendor.FABridgeC.prototype.release);

// Internal properties we could export but don't:
//   getPropertyFromAS, setPropertyInAS, callASFunction, callASMethod

// Attach FABridgeC to the window to make it "global"
window['FABridge'] = vendor.FABridgeC;

