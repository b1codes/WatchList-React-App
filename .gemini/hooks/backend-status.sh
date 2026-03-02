#!/bin/bash

# Simple check for port 5223 (Backend)
if lsof -Pi :5223 -sTCP:LISTEN -t >/dev/null ; then
    STATUS="[RUNNING]"
else
    STATUS="[DOWN]"
fi

# Use node to output valid JSON easily
node -e "
const status = process.argv[1];
const output = {
    hookSpecificOutput: {
        hookEventName: 'BeforeAgent',
        additionalContext: '\n\n## Current Backend Status\n- WatchListApi: ' + status + ' (on port 5223)'
    }
};
console.log(JSON.stringify(output));
" "$STATUS"
