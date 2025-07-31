#!/bin/sh
set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIR="$ROOT_DIR/autofill-extension"
ZIP="$ROOT_DIR/autofill-extension.zip"
rm -f "$ZIP"
(cd "$DIR" && zip -r "$ZIP" . -x '*.git*')
echo "Created $ZIP"

