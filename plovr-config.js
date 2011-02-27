{
  'id': 'fabridgec',
  'paths': '.',
  'inputs': ['lib/FABridgeC.exports.js'],
  'mode': 'ADVANCED',
  'externs': [
    'externs/fabridge.js'
  ],
  'level': 'VERBOSE',
  'define': {
    'goog.DEBUG': false
  },
  'output-wrapper': '(function(){%output%})();'
}
