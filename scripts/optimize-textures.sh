#!/bin/bash
# Optimize texture images by creating WebP versions and compressing originals.
# WebP provides ~25-35% smaller files with similar visual quality.
# The app will try WebP first, falling back to JPG/PNG for browser compatibility.

set -e

TEXTURES_DIR="public/assets/textures"
QUALITY=85
WEBP_DIR="$TEXTURES_DIR"

echo "Optimizing textures..."
echo "====================="
echo ""

TOTAL_ORIGINAL=0
TOTAL_WEBP=0
COUNT=0

optimize_image() {
  local src="$1"
  local dest="${src%.*}.webp"

  if [ -f "$dest" ]; then
    return
  fi

  local orig_size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null)
  
  cwebp -q "$QUALITY" -m 6 "$src" -o "$dest" 2>/dev/null
  
  if [ -f "$dest" ]; then
    local webp_size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest" 2>/dev/null)
    local savings=$(( (orig_size - webp_size) * 100 / orig_size ))
    echo "  $(basename "$src"): ${orig_size} -> ${webp_size} (-${savings}%)"
    TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + orig_size))
    TOTAL_WEBP=$((TOTAL_WEBP + webp_size))
    COUNT=$((COUNT + 1))
  fi
}

echo "Generating WebP versions..."
echo ""

find "$TEXTURES_DIR" -type f \( -name "*.jpg" -o -name "*.png" \) | while read -r file; do
  optimize_image "$file"
done

echo ""
echo "====================="
echo ""

if [ $COUNT -gt 0 ]; then
  SAVINGS=$(( (TOTAL_ORIGINAL - TOTAL_WEBP) * 100 / TOTAL_ORIGINAL ))
  echo "Processed: $COUNT files"
  echo "Original: $(( TOTAL_ORIGINAL / 1024 / 1024 )) MB"
  echo "WebP: $(( TOTAL_WEBP / 1024 / 1024 )) MB"
  echo "Savings: ~${SAVINGS}%"
fi

echo ""
echo "WebP files created alongside originals."
echo "Update fallback chain in components/planet-3d.tsx to prefer .webp"
