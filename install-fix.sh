#!/bin/bash

# Test and install script for German special character transformation fix
# This script is designed to safely update the Dictation Tool code

echo "German Dictation Tool - Transformation Fix Installation"
echo "======================================================"

# Check if we're in the right directory
if [[ ! -d js/modules ]]; then
    echo "Error: Please run this script from the root directory of the project"
    echo "Example: ./install-fix.sh"
    exit 1
fi

# Create backup directory
echo "Creating backups..."
mkdir -p backups/$(date +%Y%m%d)

# Backup original files
echo "Backing up original files..."
cp js/modules/inputManager.js backups/$(date +%Y%m%d)/inputManager.js.bak
cp js/modules/textComparison.js backups/$(date +%Y%m%d)/textComparison.js.bak

# Check if the new files exist
if [[ ! -f js/modules/inputManager.js.new || ! -f js/modules/textComparison.js.new ]]; then
    echo "Error: New files not found. Please ensure inputManager.js.new and textComparison.js.new exist."
    exit 1
fi

# Install new files
echo "Installing fixed files..."
mv js/modules/inputManager.js.new js/modules/inputManager.js
mv js/modules/textComparison.js.new js/modules/textComparison.js

echo "Installation complete!"
echo ""
echo "Changes made:"
echo "1. Added comprehensive error handling to input transformation"
echo "2. Implemented defensive coding against iframe limitations"
echo "3. Improved robustness for special character transformations"
echo "4. Added graceful degradation for restricted environments"
echo ""
echo "Backups of original files are stored in: backups/$(date +%Y%m%d)/"
echo ""
echo "To test the installation, please open the application in your browser."
echo "The transformations (ae → ä, a: → ä, etc.) should now work in Teachable."
