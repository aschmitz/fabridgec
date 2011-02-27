/**
 * @fileoverview Exports the human-readable properties for FABridgeC (to match
 * the main ones provided by FABridge). Note that they are exported under
 * FABridge, *not* FABridgeC, for compatibility with FABridge implementations.
 * 
 * @author Andy Schmitz (http://lardbucket.org)
 * 
 * FABridgeC is licensed under the MIT license. See the LICENSE file with the
 * distribution or http://www.opensource.org/licenses/mit-license.php
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

