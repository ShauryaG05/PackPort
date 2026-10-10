#!/bin/bash

echo "Installing PackPort Agent..."

curl -L https://YOUR-DOWNLOAD-URL/PackPortAgent -o /tmp/PackPortAgent

chmod +x /tmp/PackPortAgent

sudo mv /tmp/PackPortAgent /usr/local/bin/PackPortAgent

echo "PackPort Agent installed successfully!"