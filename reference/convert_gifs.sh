#!/bin/bash
set -e

INPUT_DIR="/Users/tingshang/Desktop/claude-workspace/project-wechat-sticker-pack/reference/Gif Prep"
OUTPUT_DIR="/Users/tingshang/Desktop/claude-workspace/project-wechat-sticker-pack/reference/Gif"
MAX_SIZE=500000  # 500KB in bytes
PALETTE_DIR=$(mktemp -d)

trap "rm -rf $PALETTE_DIR" EXIT

convert_video() {
    local input="$1"
    local basename="$2"
    local output="$OUTPUT_DIR/${basename}.gif"

    echo ""
    echo "========================================"
    echo "Processing: $basename"
    echo "========================================"

    local widths=(240 220 200 180 160)
    local fps_values=(15 12 10 8)
    local best_file=""

    for width in "${widths[@]}"; do
        for fps in "${fps_values[@]}"; do
            local palette="$PALETTE_DIR/${basename}_palette.png"
            local temp_gif="$PALETTE_DIR/${basename}_temp.gif"

            ffmpeg -y -v quiet -i "$input" \
                -vf "fps=$fps,scale=$width:-1:flags=lanczos,palettegen=max_colors=256:stats_mode=diff" \
                "$palette"

            ffmpeg -y -v quiet -i "$input" -i "$palette" \
                -lavfi "fps=$fps,scale=$width:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
                -loop 0 \
                "$temp_gif"

            local size=$(stat -f%z "$temp_gif" 2>/dev/null || stat -c%s "$temp_gif" 2>/dev/null)
            local size_kb=$((size / 1024))

            if [ "$size" -le "$MAX_SIZE" ]; then
                echo "  ✓ ${width}px @ ${fps}fps → ${size_kb}KB"
                cp "$temp_gif" "$output"
                rm -f "$palette" "$temp_gif"
                return 0
            else
                echo "  ✗ ${width}px @ ${fps}fps → ${size_kb}KB (too large)"
            fi

            rm -f "$palette" "$temp_gif"
        done
    done

    echo "  ⚠ Could not get under 500KB, using smallest achieved"
    local palette="$PALETTE_DIR/${basename}_palette.png"
    local temp_gif="$PALETTE_DIR/${basename}_temp.gif"

    ffmpeg -y -v quiet -i "$input" \
        -vf "fps=8,scale=140:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" \
        "$palette"

    ffmpeg -y -v quiet -i "$input" -i "$palette" \
        -lavfi "fps=8,scale=140:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
        -loop 0 \
        "$temp_gif"

    cp "$temp_gif" "$output"
    local final_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
    echo "  → Final: $((final_size / 1024))KB (fallback)"
    rm -f "$palette" "$temp_gif"
}

echo "Converting videos to WeChat sticker GIFs (<500KB, looping)"
echo ""

for f in "$INPUT_DIR"/*.MOV "$INPUT_DIR"/*.mp4; do
    [ -f "$f" ] || continue
    filename=$(basename "$f")
    name="${filename%.*}"
    convert_video "$f" "$name"
done

echo ""
echo "========================================"
echo "All done! Results in: $OUTPUT_DIR"
echo "========================================"
ls -lh "$OUTPUT_DIR"/*.gif
