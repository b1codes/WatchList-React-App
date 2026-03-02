#!/bin/bash
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$HOOK_DIR/secret-guard.js"
