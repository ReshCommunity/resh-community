#!/bin/bash
# Batch Image Generation for Resh Community Blog
# Uses Pollinations.ai - Free, cloud-based, no local processing, no API key needed
#
# Usage: bash batch-generate-images.sh [batch-number|all]
#
# This is a FREE alternative to Qwen/Gemini that runs on cloud servers

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/public/images/posts"

echo "=========================================="
echo "Resh Community - Batch Image Generation"
echo "Using: Pollinations.ai (Free, Cloud-based)"
echo "=========================================="
echo ""
echo "Output: $OUTPUT_DIR"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found. Please install Python 3."
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Count existing images
EXISTING=$(ls -1 "$OUTPUT_DIR"/*.webp 2>/dev/null | wc -l || echo "0")
echo "Existing images: $EXISTING"
echo ""

# Parse optional batch number argument
BATCH_NUM="${1:-all}"

case "$BATCH_NUM" in
    1)
        echo "Processing BATCH 1: Crypto Basics (9 images)"
        sed -n '4,12p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    2)
        echo "Processing BATCH 2: DeFi (23 images)"
        sed -n '15,37p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    3)
        echo "Processing BATCH 3: Trading (22 images)"
        sed -n '40,61p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    4)
        echo "Processing BATCH 4: Security and Wallets (16 images)"
        sed -n '64,79p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    5)
        echo "Processing BATCH 5: Buying and Exchanges (9 images)"
        sed -n '82,90p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    6)
        echo "Processing BATCH 6: NFTs and Web3 (4 images)"
        sed -n '93,96p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    7)
        echo "Processing BATCH 7: Social and Community (7 images)"
        sed -n '99,105p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    8)
        echo "Processing BATCH 8: News and Case Studies (11 images)"
        sed -n '108,118p' "$SCRIPT_DIR/batch-images-pollinations.txt" > /tmp/batch-temp.txt
        ;;
    all)
        echo "Processing ALL batches (101 images)"
        echo ""
        echo "This will take a while. You can also run specific batches:"
        echo "  ./batch-generate-images.sh 1    # Crypto Basics (9 images)"
        echo "  ./batch-generate-images.sh 2    # DeFi (23 images)"
        echo "  ./batch-generate-images.sh 3    # Trading (22 images)"
        echo "  ./batch-generate-images.sh 4    # Security and Wallets (16 images)"
        echo "  ./batch-generate-images.sh 5    # Buying and Exchanges (9 images)"
        echo "  ./batch-generate-images.sh 6    # NFTs and Web3 (4 images)"
        echo "  ./batch-generate-images.sh 7    # Social and Community (7 images)"
        echo "  ./batch-generate-images.sh 8    # News and Case Studies (11 images)"
        echo ""
        read -p "Continue with all 101 images? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        grep -v '^#' "$SCRIPT_DIR/batch-images-pollinations.txt" | grep -v '^$' > /tmp/batch-temp.txt
        ;;
    *)
        echo "Usage: $0 [batch-number|all]"
        echo ""
        echo "Batch numbers:"
        echo "  1 - Crypto Basics (9 images)"
        echo "  2 - DeFi (23 images)"
        echo "  3 - Trading (22 images)"
        echo "  4 - Security and Wallets (16 images)"
        echo "  5 - Buying and Exchanges (9 images)"
        echo "  6 - NFTs and Web3 (4 images)"
        echo "  7 - Social and Community (7 images)"
        echo "  8 - News and Case Studies (11 images)"
        echo "  all - All batches (101 images)"
        exit 1
        ;;
esac

echo ""
echo "Starting batch processing..."
echo ""

# Run the Python script with the batch file
python3 "$SCRIPT_DIR/generate-images-pollinations.py" --batch /tmp/batch-temp.txt

# Cleanup
rm -f /tmp/batch-temp.txt

echo ""
echo "=========================================="
echo "Batch generation complete!"
echo ""

NEW_COUNT=$(ls -1 "$OUTPUT_DIR"/*.webp 2>/dev/null | wc -l || echo "0")
echo "Total images: $NEW_COUNT"
echo "Newly generated: $((NEW_COUNT - EXISTING))"
echo ""
echo "Image location: $OUTPUT_DIR"
echo "=========================================="
