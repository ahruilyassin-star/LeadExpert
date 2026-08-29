#!/bin/bash
# One-line YouTube MCP server installer
# Usage: bash install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing YouTube MCP server dependencies..."
pip install -r "$SCRIPT_DIR/requirements.txt" --quiet

echo "Testing installation..."
python3 -c "from youtube_transcript_api import YouTubeTranscriptApi; import yt_dlp; print('OK')"

# Detect Claude Code settings file location
CLAUDE_SETTINGS=""
if [ -f "$HOME/.claude/settings.json" ]; then
    CLAUDE_SETTINGS="$HOME/.claude/settings.json"
elif [ -f ".claude/settings.json" ]; then
    CLAUDE_SETTINGS=".claude/settings.json"
fi

SERVER_PATH="$SCRIPT_DIR/server.py"

echo ""
echo "Add this to your Claude Code MCP settings:"
echo "  File: ~/.claude/settings.json (global) or .claude/settings.json (project)"
echo ""
cat <<EOF
{
  "mcpServers": {
    "youtube": {
      "command": "python3",
      "args": ["$SERVER_PATH"]
    }
  }
}
EOF

echo ""
echo "Or run: claude mcp add youtube python3 '$SERVER_PATH'"
echo ""
echo "Done! Restart Claude Code and use /youtube <url> to read any video."
