/**
 * @fileoverview The code for FABridgeC, a Closure-compilable,
 * FABridge-compatable library. Based (very heavily) on Adobe's FABridge.
 * 
 * @author Andy Schmitz (http://lardbucket.org)
 * 
 * @license Portions copyright 2006 Adobe Systems Incorporated
 * Copyright 2011 Andy Schmitz
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

goog.provide('vendor.FABridgeC');

/**
 * The Bridge class, responsible for navigating AS instances
 * @param {FABridgeObject} target
 * @param {string} bridgeName
 * @constructor
 */
vendor.FABridgeC = function(target, bridgeName) {
    this.target = target;
    this.remoteTypeCache = {};
    this.remoteInstanceCache = {};
    this.remoteFunctionCache = {};
    this.localFunctionCache = {};
    this.bridgeID = vendor.FABridgeC.nextBridgeID++;
    this.name = bridgeName;
    this.nextLocalFuncID = 0;
    vendor.FABridgeC.instances[this.name] = this;
    vendor.FABridgeC.idMap[this.bridgeID] = this;

    return this;
}

// type codes for packed values
/**
 * The type ID for a packed primitive data type.
 * @type {undefined}
 * @const
 */
vendor.FABridgeC.TYPE_PRIMITIVE = undefined; // Seriously guys?

/**
 * The type ID for a packed ActionScript instance.
 * @type {number}
 * @const
 */
vendor.FABridgeC.TYPE_ASINSTANCE =  1;

/**
 * The type ID for a packed ActionScript function.
 * @type {number}
 * @const
 */
vendor.FABridgeC.TYPE_ASFUNCTION =  2;

/**
 * The type ID for a packed JavaScript function.
 * @type {number}
 * @const
 */
vendor.FABridgeC.TYPE_JSFUNCTION =  3;

/**
 * The type ID for a packed anonymous data type.
 * @type {number}
 * @const
 */
vendor.FABridgeC.TYPE_ANONYMOUS =   4;

/**
 * The callbacks for a given bridge. Keyed by bridge name, each callback will
 * be called in the context of the bridge.
 * @type {Object.<Array.<function(this:vendor.FABridgeC)>>}
 */
vendor.FABridgeC.initCallbacks = {};

/**
 * Stores user-defined types. It's not immediately clear when those would be
 * used. It appears as though vendor.FABridgeC.addToUserTypes is the only place
 * in which this is accessed.
 * @type {Object.<Object>}
 */
vendor.FABridgeC.userTypes = {};

/**
 * Adds to the user-defined types.
 * @param {...string} newTypes
 */
vendor.FABridgeC.addToUserTypes = function(newTypes) {
	for (var i = 0; i < arguments.length; i++)
	{
		vendor.FABridgeC.userTypes[arguments[i]] = {
			'typeName': arguments[i], 
			'enriched': false
		};
	}
}

/**
 * Converts an arguments object to an array.
 * @return {Array}
 */
vendor.FABridgeC.argsToArray = function(args)
{
    var result = [];
    for (var i = 0; i < args.length; i++)
    {
        result[i] = args[i];
    }
    return result;
}

/**
 * Used to create a pseudo-object of a given type, by resetting the prototype.
 * @param {number} objID
 * @constructor
 */
vendor.FABridgeC.instanceFactory = function(objID)
{
    this.fb_instance_id = objID;
    return this;
}

/**
 * Invokes a JavaScript function. Called from Flash, and must be exposed
 * globally as FABridge__invokeJSFunction.
 * @param {Array} args
 * @return {*} The function result.
 */
vendor.FABridgeC.invokeJSFunction = function(args)
{  
    var funcID = args[0];
    var throughArgs = args.concat();//FABridge.argsToArray(arguments);
    throughArgs.shift();
   
    var bridge = vendor.FABridgeC.extractBridgeFromID(funcID);
    return bridge.invokeLocalFunction(funcID, throughArgs);
}
goog.exportProperty(window, 'FABridge__invokeJSFunction',
    vendor.FABridgeC.invokeJSFunction);

/**
 * Add an initialization callback for a given bridge. When the bridge listed
 * is instantiated, the callback will be called within the context of the
 * bridge.
 * 
 * If the bridge has already been loaded, the callback will be called
 * immediately. 
 * @param {string} bridgeName
 * @param {function(this:vendor.FABridgeC)} callback
 */
vendor.FABridgeC.addInitializationCallback = function(bridgeName, callback)
{
    var inst = vendor.FABridgeC.instances[bridgeName];
    if (inst != undefined)
    {
        callback.call(inst);
        return;
    }

    var callbackList = vendor.FABridgeC.initCallbacks[bridgeName];
    if(callbackList == null)
    {
        vendor.FABridgeC.initCallbacks[bridgeName] = callbackList = [];
    }

    callbackList.push(callback);
}

// updated for changes to SWFObject2
/**
 * Tells FABridgeC that the given bridge has been initialized on the Flash
 * side, and starts setting it up in JavaScript. Must be exposed globally as
 * FABridge__bridgeInitialized.
 * @param {string} bridgeName
 * @return {boolean} Success
 */
vendor.FABridgeC.bridgeInitialized = function(bridgeName) {
    var objects = document.getElementsByTagName("object");
    var ol = objects.length;
    var activeObjects = [];
    if (ol > 0) {
		for (var i = 0; i < ol; i++) {
			if (typeof objects[i].SetVariable != "undefined") {
				activeObjects[activeObjects.length] = objects[i];
			}
		}
	}
    var embeds = document.getElementsByTagName("embed");
    var el = embeds.length;
    var activeEmbeds = [];
    if (el > 0) {
		for (var j = 0; j < el; j++) {
			if (typeof embeds[j].SetVariable != "undefined") {
            	activeEmbeds[activeEmbeds.length] = embeds[j];
            }
        }
    }
    var aol = activeObjects.length;
    var ael = activeEmbeds.length;
    var searchStr = "bridgeName="+ bridgeName;
    if ((aol == 1 && !ael) || (aol == 1 && ael == 1)) {
    	vendor.FABridgeC.attachBridge(activeObjects[0], bridgeName);	 
    }
    else if (ael == 1 && !aol) {
    	vendor.FABridgeC.attachBridge(activeEmbeds[0], bridgeName);
        }
    else {
                var flash_found = false;
		if (aol > 1) {
			for (var k = 0; k < aol; k++) {
				 var params = activeObjects[k].childNodes;
				 for (var l = 0; l < params.length; l++) {
					var param = params[l];
					if (param.nodeType == 1 && param.tagName.toLowerCase() == "param" && param["name"].toLowerCase() == "flashvars" && param["value"].indexOf(searchStr) >= 0) {
						vendor.FABridgeC.attachBridge(activeObjects[k], bridgeName);
                            flash_found = true;
                            break;
                        }
                    }
                if (flash_found) {
                    break;
                }
            }
        }
		if (!flash_found && ael > 1) {
			for (var m = 0; m < ael; m++) {
				var flashVars = activeEmbeds[m].attributes.getNamedItem("flashVars").nodeValue;
				if (flashVars.indexOf(searchStr) >= 0) {
					vendor.FABridgeC.attachBridge(activeEmbeds[m], bridgeName);
					break;
    }
            }
        }
    }
    return true;
}
goog.exportProperty(window, 'FABridge__bridgeInitialized',
    vendor.FABridgeC.bridgeInitialized);

// used to track multiple bridge instances, since callbacks from AS are global across the page.

/**
 * The next free bridge ID.
 * @type {number}
 */
vendor.FABridgeC.nextBridgeID = 0;
/**
 * A map of bridge name to bridge instance.
 * @type {Object.<vendor.FABridgeC>}
 */
vendor.FABridgeC.instances = {};
/**
 * A map of bridge ID to bridge instance.
 * @type {Object.<vendor.FABridgeC>}
 */
vendor.FABridgeC.idMap = {};
/**
 * The number of references to FABridgeC. (Used for self-garbage collection.)
 * @type {number}
 */
vendor.FABridgeC.refCount = 0;

/**
 * Gets a bridge ID from a function ID.
 * @param {number} id
 * @return {vendor.FABridgeC}
 * @private
 */
vendor.FABridgeC.extractBridgeFromID = function(id)
{
    var bridgeID = (id >> 16);
    return vendor.FABridgeC.idMap[bridgeID];
}

/**
 * Attaches a bridge instance to the existing FABridgeC handlers. Calls all
 * necessary callbacks, etc.
 * @param {FABridgeObject} instance
 * @param {string} bridgeName
 */
vendor.FABridgeC.attachBridge = function(instance, bridgeName)
{
    var newBridgeInstance = new vendor.FABridgeC(instance, bridgeName);

    vendor.FABridgeC[bridgeName] = newBridgeInstance;

/*  vendor.FABridgeC[bridgeName] = function() {
        return newBridgeInstance.root();
    }
*/
    var callbacks = vendor.FABridgeC.initCallbacks[bridgeName];
    if (callbacks == null)
    {
        return;
    }
    for (var i = 0; i < callbacks.length; i++)
    {
        callbacks[i].call(newBridgeInstance);
    }
    delete vendor.FABridgeC.initCallbacks[bridgeName]
}

/**
 * Some methods can't be proxied. This lists those methods. You can use the
 * explicit get,set, and call methods if necessary. Note that if you're not
 * using FABridgeC from within Closure, you will have to manually add exports
 * for those functions to FABridgeC.exports.js and recompile.
 * @type {Object.<boolean>}
 */
vendor.FABridgeC.blockedMethods =
{
    // These are quoted to avoid Closure "optimizing" them to different values.
    'toString': true,
    'get': true,
    'set': true,
    'call': true
};

vendor.FABridgeC.prototype = {
    /**
     * Returns the root of the Flash object.
     * @return {*}
     */
    root: function() {
      return this.deserialize(this.target.getRoot());
    },
    
    /**
     * Clears all of the AS objects in the cache maps.
     */
    releaseASObjects: function() {
      return this.target.releaseASObjects();
    },
    
    /**
     * Clears a specific object in ActionScript from the type maps.
     * @param {Object} value
     * @return {boolean}
     */
    releaseNamedASObject: function(value) {
      if(typeof(value) != "object") {
        return false;
      } else {
        var ret =  this.target.releaseNamedASObject(value.fb_instance_id);
        return ret;
      }
    },
    
    /**
     * Create and return a new ActionScript Object.
     * @param {string} className
     * @return {*}
     */
    create: function(className) {
      return this.deserialize(this.target.create(className));
    },
    
    // Utilities
    
    /**
     * Make a local ID global by adding this bridge ID to it.
     * @param {number} token
     * @return {number}
     * @private
     */
    makeID: function(token) {
      return (this.bridgeID << 16) + token;
    },
    
    // Low level access to the Flash object
    
    /**
     * Get a named property from an ActionScript object.
     * @param {number} objRef
     * @param {string} propName
     * @return {*}
     */
    getPropertyFromAS: function(objRef, propName) {
      if (vendor.FABridgeC.refCount > 0) {
        throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
      } else {
        vendor.FABridgeC.refCount++;
        var retVal = this.target.getPropFromAS(objRef, propName);
        retVal = this.handleError(retVal);
        vendor.FABridgeC.refCount--;
        return retVal;
      }
    },
    
    /**
     * Set a named property on an ActionScript object.
     * @param {number} objRef
     * @param {string} propName
     * @param {*} value
     * @return {*}
     */
    setPropertyInAS: function(objRef,propName, value) {
      if (vendor.FABridgeC.refCount > 0) {
        throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
      } else {
        vendor.FABridgeC.refCount++;
        var retVal = this.target.setPropInAS(objRef,propName, this.serialize(value));
        retVal = this.handleError(retVal);
        vendor.FABridgeC.refCount--;
        return retVal;
      }
    },
    
    /**
     * Call an ActionScript function.
     * @param {number} funcID
     * @param {*} args
     * @return {*}
     */
    callASFunction: function(funcID, args) {
      if (vendor.FABridgeC.refCount > 0) {
        throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
      } else {
        vendor.FABridgeC.refCount++;
        var retVal = this.target.invokeASFunction(funcID, this.serialize(args));
        retVal = this.handleError(retVal);
        vendor.FABridgeC.refCount--;
        return retVal;
      }
    },
    
    /**
     * Call a method on an ActionScript object.
     * @param {number} objID
     * @param {string} funcName
     * @param {Object} args
     * @return {*}
     */
    callASMethod: function(objID, funcName, args) {
      if (vendor.FABridgeC.refCount > 0) {
        throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
      } else {
        vendor.FABridgeC.refCount++;
        args = this.serialize(args);
        var retVal = this.target.invokeASMethod(objID, funcName, args);
        retVal = this.handleError(retVal);
        vendor.FABridgeC.refCount--;
        return retVal;
      }
    },
    
    // Internals
    
    /**
     * Callback from Flash that executes a local JS function. Used mostly when
     * setting JS functions as callbacks on events.
     * @param {number} funcID
     * @param {FABridgeSerializedRetval} args
     * @return {*}
     * @private
     */
    invokeLocalFunction: function(funcID, args) {
      var result;
      var func = this.localFunctionCache[funcID];

      if(func != undefined) {
        result = this.serialize(func.apply(null, this.deserialize(args)));
      }

      return result;
    },
    
    /**
     * Accepts an object reference, returns a type object matching the obj reference.
     * @param {string} objTypeName
     * @return {vendor.FABridgeC.ASProxy}
     * @private
     */
    getTypeFromName: function(objTypeName) {
      return this.remoteTypeCache[objTypeName];
    },
    
    /**
     * Create an AS proxy for the given object ID and type.
     * @param {number} objID
     * @param {string} typeName
     * @private
     */
    createProxy: function(objID, typeName) {
      var objType = this.getTypeFromName(typeName);
      
      vendor.FABridgeC.instanceFactory.prototype = objType;
      var instance = new vendor.FABridgeC.instanceFactory(objID);
      
      this.remoteInstanceCache[objID] = instance;
      return instance;
    },
    
    /**
     * Return the proxy associated with the given object ID
     * @param {number} objID
     * @return {Object}
     * @private
     */
    getProxy: function(objID) {
      return this.remoteInstanceCache[objID];
    },
    
    /**
     * Accepts a type structure, returns a constructed type
     * @param {{accessors: Array.<string>, methods: Array.<string>}} typeData
     * @return {vendor.FABridgeC.ASProxy}
     * @private
     */
    addTypeDataToCache: function(typeData) {
      var newType = new vendor.FABridgeC.ASProxy(this, typeData.name);
      var accessors = typeData.accessors;
      for (var i = 0; i < accessors.length; i++) {
        this.addPropertyToType(newType, accessors[i]);
      }
      
      var methods = typeData.methods;
      for (var i = 0; i < methods.length; i++) {
        if (vendor.FABridgeC.blockedMethods[methods[i]] == undefined) {
          this.addMethodToType(newType, methods[i]);
        }
      }
      
      this.remoteTypeCache[newType.typeName] = newType;
      return newType;
    },
    
    /**
     * Add a property to a typename. Used to define the properties that can be
     * referenced on an AS proxied object.
     * @param {vendor.FABridgeC.ASProxy} typeName
     * @param {string} propName
     * @private
     */
    addPropertyToType: function(typeName, propName) {
      var c = propName.charAt(0);
      var setterName;
      var getterName;
      if(c >= "a" && c <= "z") {
        getterName = "get" + c.toUpperCase() + propName.substr(1);
        setterName = "set" + c.toUpperCase() + propName.substr(1);
      } else {
        getterName = "get" + propName;
        setterName = "set" + propName;
      }
      typeName[setterName] = function(val) {
        this.bridge.setPropertyInAS(this.fb_instance_id, propName, val);
      }
      typeName[getterName] = function() {
        return this.bridge.deserialize(this.bridge.getPropertyFromAS(this.fb_instance_id, propName));
      }
    },
    
    /**
     * Add a method to a typename. Used to define the methods that can be
     * called on an AS proxied object.
     * @param {vendor.FABridgeC.ASProxy} typeName
     * @param {string} methodName
     * @private
     */
    addMethodToType: function(typeName, methodName) {
      typeName[methodName] = function() {
        return this.bridge.deserialize(this.bridge.callASMethod(this.fb_instance_id, methodName, vendor.FABridgeC.argsToArray(arguments)));
      }
    },
    
    /**
     * Returns the AS proxy for the specified function ID. If a proxy doesn't
     * exist, it creates one and caches it locally.
     * @param {number} funcID
     * @return {Function}
     * @private
     */
    getFunctionProxy: function(funcID) {
      var bridge = this;
      if (this.remoteFunctionCache[funcID] == null) {
        this.remoteFunctionCache[funcID] = function() {
          bridge.callASFunction(funcID, vendor.FABridgeC.argsToArray(arguments));
        }
      }
      return this.remoteFunctionCache[funcID];
    },
    
    /**
     * Returns the ID of the given function. If an ID doesnt exist, one is
     * created and added to the local cache
     * @param {Function} func
     * @return {number}
     * @private
     */
    getFunctionID: function(func) {
      if (func.__bridge_id__ == undefined) {
        func.__bridge_id__ = this.makeID(this.nextLocalFuncID++);
        this.localFunctionCache[func.__bridge_id__] = func;
      }
      return func.__bridge_id__;
    },
    
    /**
     * Serializes an object into a packed version for Flash.
     * @param {*} value
     * @return {*}
     * @private
     */
    serialize: function(value) {
      var result = {};

      var t = typeof(value);
      //primitives are kept as such
      if (t == "number" || t == "string" || t == "boolean" || t == null ||
          t == undefined) {
        result = value;
      } else if (value instanceof Array) {
        //arrays are serializesd recursively
        result = [];
        for (var i = 0; i < value.length; i++) {
          result[i] = this.serialize(value[i]);
        }
      } else if (t == "function") {
        //js functions are assigned an ID and stored in the local cache 
        result.type = vendor.FABridgeC.TYPE_JSFUNCTION;
        result.value = this.getFunctionID(value);
      } else if (value instanceof vendor.FABridgeC.ASProxy) {
        result.type = vendor.FABridgeC.TYPE_ASINSTANCE;
        result.value = value.fb_instance_id;
      } else {
        result.type = vendor.FABridgeC.TYPE_ANONYMOUS;
        result.value = value;
      }

      return result;
    },
    
    /**
     * Deserializes a packed response from Flash.
     * On deserialization we always check the return for the specific error
     * code that is used to marshall NPE's into JS errors. We recursively
     * deserialize arrays and objects.
     * @param {FABridgeSerializedRetval} packedValue
     * @private
     */
    deserialize: function(packedValue) {
      var result;
      
      var t = typeof(packedValue);
      if (t == "number" || t == "string" || t == "boolean" ||
          packedValue == null || packedValue == undefined) {
        result = this.handleError(packedValue);
      } else if (packedValue instanceof Array) {
        result = [];
        for (var i = 0; i < packedValue.length; i++) {
          result[i] = this.deserialize(packedValue[i]);
        }
      } else if (t == "object") {
        for(var i = 0; i < packedValue.newTypes.length; i++) {
          this.addTypeDataToCache(packedValue.newTypes[i]);
        }
        for (var aRefID in packedValue.newRefs) {
          this.createProxy(aRefID, packedValue.newRefs[aRefID]);
        }
        if (packedValue.type == vendor.FABridgeC.TYPE_PRIMITIVE) {
          result = packedValue.value;
        } else if (packedValue.type == vendor.FABridgeC.TYPE_ASFUNCTION) {
          result = this.getFunctionProxy(packedValue.value);
        } else if (packedValue.type == vendor.FABridgeC.TYPE_ASINSTANCE) {
          result = this.getProxy(packedValue.value);
        } else if (packedValue.type == vendor.FABridgeC.TYPE_ANONYMOUS) {
          result = packedValue.value;
        }
      }
      return result;
    },
    
    /**
     * Increases the reference count for the given object.
     * @param {vendor.FABridgeC} obj
     */
    addRef: function(obj) {
      this.target.incRef(obj.fb_instance_id);
    },
    
    /**
     * Decrease the reference count for the given object and release it if
     * needed.
     * @param {vendor.FABridgeC} obj
     */
    release:function(obj) {
      this.target.releaseRef(obj.fb_instance_id);
    },
    
    /**
     * Check the given value for the components of the hard-coded error code
     * "__FLASHERROR" used to marshall NPE's into Flash.
     * @param {string} value
     * @private
     */
    handleError: function(value) {
      if (typeof(value)=='string' && value.indexOf('__FLASHERROR')==0) {
        var myErrorMessage = value.split('||');
        if(vendor.FABridgeC.refCount > 0 ) {
          vendor.FABridgeC.refCount--;
        }
        throw new Error(myErrorMessage[1]);
      }
      else {
        return value;
      }   
    }
};

/**
 * The root ASProxy class that facades a flash object
 * @constructor
 * @param {vendor.FABridgeC} bridge
 * @param {string} typeName
 */
vendor.FABridgeC.ASProxy = function(bridge, typeName) {
    this.bridge = bridge;
    this.typeName = typeName;
    return this;
};

vendor.FABridgeC.ASProxy.prototype = {
  /**
   * Get and return a property from a Flash object.
   * @param {string} propName
   * @return {*}
   */
  get: function(propName) {
    return this.bridge.deserialize(
        this.bridge.getPropertyFromAS(this.fb_instance_id, propName));
  },
  
  /**
   * Set a property on a Flash object (in ActionScript).
   * @param {string} propName
   * @param {*} value
   */
  set: function(propName, value) {
    this.bridge.setPropertyInAS(this.fb_instance_id, propName, value);
  },
  
  /**
   * Call a function inside a Flash object. No return value.
   * @param {string} funcName
   * @param {*} args
   */
  call: function(funcName, args) {
    this.bridge.callASMethod(this.fb_instance_id, funcName, args);
  },
  
  /**
   * Internally adds a reference to the Flash object.
   */
  addRef: function() {
    this.bridge.addRef(this);
  },
  
  /**
   * Internally removes a reference to the Flash object.
   */
  release: function() {
    this.bridge.release(this);
  }
};
