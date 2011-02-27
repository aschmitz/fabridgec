#!/bin/bash

# If you don't have plovr set up in your PATH, uncomment and modify this line:
# alias plovr='java -jar /path/to/plovr.jar'

# Compile the file using the Closure Compiler.
plovr build plovr-config.js > fabridgec.js

# Compress the file first using gzip.
gzip -9 -c fabridgec.js > fabridgec.js.gz

# Use AdvanceCOMP to further compress the output.
advdef -z -4 fabridgec.js.gz
