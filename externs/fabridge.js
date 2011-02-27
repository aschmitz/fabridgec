/**
 * @fileoverview Definitions for (at least some) FABridge Flash object methods.
 * Derived from the canonical FABridge.js and FABridge.as
 * 
 * @author Andy Schmitz (http://lardbucket.org)
 * Available under the MIT (Expat) license. See FABridgeC.exports.js for
 *     more details.
 * 
 * @externs
 */

/**
 * @typedef {{accessors: Array.<string>, methods: Array.<string>}}
 */
var FABridgeNewTypes = { accessors: [], methods: [] };

/**
 * @typedef {{newTypes: FABridgeNewTypes, newRefs: Object}}
 */
var FABridgeSerializedObj = { newTypes: [], newRefs: {} };

/**
 * @typedef {number|string|null|undefined|Array.<FABridgeSerializedRetval>|FABridgeSerializedObj}
 */
var FABridgeSerializedRetval;

/**
 * @constructor
 */
function FABridgeObject() {};

/**
 * Retrieve a proxy for the root object of the Flash file.
 * @return {FABridgeSerializedObj}
 */
FABridgeObject.prototype.getRoot = function() {};

/**
 * Gets the value of the referenced property from ActionScript.
 * @param {number} objId
 * @param {string} propName
 * @return {FABridgeSerializedRetval}
 */
FABridgeObject.prototype.getPropFromAS = function(objId, propName) {};

/**
 * Sets the value of the referenced property in ActionScript.
 * @param {number} objId
 * @param {string} propName
 * @param {*} serializedVal
 * @return {*}
 */
FABridgeObject.prototype.setPropInAS = function(objId, propName, serializedVal) {};

/**
 * Invokes the referenced method in ActionScript with the given arguments.
 * @param {number} objId
 * @param {string} funcName
 * @param {Object} args
 * @return {*}
 */
FABridgeObject.prototype.invokeASMethod = function(objId, funcName, args) {};

/**
 * Invokes the referenced function in ActionScript with the given arguments.
 * @param {number} funcId
 * @param {Object} serializedArgs
 * @return {*}
 */
FABridgeObject.prototype.invokeASFunction = function(funcId, serializedArgs) {};

/**
 * Releases all ActionScript objects.
 */
FABridgeObject.prototype.releaseASObjects = function() {};

/**
 * Creates a new ActionScript object.
 * @param {string} className
 * @return {*}
 */
FABridgeObject.prototype.create = function(className) {};

/**
 * Releases the referenced ActionScript object.
 * @param {number} objId
 * @return {boolean}
 */
FABridgeObject.prototype.releaseNamedASObject = function(objId) {};

/**
 * Increases the Flash-side reference count for the given object.
 * @param {number} objId
 */
FABridgeObject.prototype.incRef = function(objId) {};

/**
 * Decreases the Flash-side reference count for the given object.
 * @param {number} objId
 */
FABridgeObject.prototype.releaseRef = function(objId) {};

