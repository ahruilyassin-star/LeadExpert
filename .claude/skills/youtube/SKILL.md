---
name: youtube
description: Read, transcribe, and analyze any YouTube video or Short. Extracts transcript, metadata, and key insights. Use when the user shares a YouTube URL or asks to watch/read/analyze a video.
---

# YouTube Video Reader

Read the full content of any YouTube video — transcript, metadata, key points.

## When to trigger

- User shares a YouTube URL (youtube.com, youtu.be, youtube.com/shorts/)
- User says "watch this", "read this video", "what does this video say"
- User asks to install or apply something from a YouTube video
- Any request involving a YouTube link

## How to read a video

### Method 1: MCP tool (preferred — works when server is running locally)

Call `mcp__youtube__youtube_read` with the URL. This returns full transcript + metadata.

If the tool is not available, fall through to Method 2.

### Method 2: Bash via youtube-transcript-api (works in this environment if YouTube not blocked)

```bash
python3 -c "
import os, sys
os.environ['REQUESTS_CA_BUNDLE'] = '/root/.ccr/ca-bundle.crt'
from youtube_transcript_api import YouTubeTranscriptApi
import re

url = sys.argv[1]
vid_match = re.search(r'(?:v=|shorts/|youtu\.be/)([a-zA-Z0-9_-]{11})', url)
vid_id = vid_match.group(1) if vid_match else url

api = YouTubeTranscriptApi()
try:
    t = api.fetch(vid_id, languages=['nl', 'en'])
    print(' '.join(e.text for e in t))
except Exception as e:
    print(f'ERROR: {e}')
" "<URL>"
```

Also try yt-dlp for metadata:
```bash
yt-dlp --dump-json --no-playlist "<URL>" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'Title: {d[\"title\"]}')
print(f'Description: {d.get(\"description\",\"\")[:500]}')
"
```

### Method 3: WebSearch fallback (always available)

When direct access is blocked, use WebSearch to find video content:

1. Search for the video title: `site:youtube.com "<video_id>"` or the video title
2. Search for transcript services: `youtube "<video_id>" transcript`
3. Search for video description and comments that summarize the content
4. Check if the content is discussed on Reddit, blogs, or documentation sites

WebSearch queries to try in order:
```
youtube MkSJN_kK8L4 transcript
youtube.com/shorts/MkSJN_kK8L4 what is this video about
"MkSJN_kK8L4" site:reddit.com OR site:github.com
```

## After getting the content

1. Present the transcript/content clearly
2. If the video shows something to install (a tool, prompt, script, config):
   - Extract the exact instructions from the transcript
   - Implement them immediately
   - Apply to every Claude prompt if requested (via CLAUDE.md or hooks)
3. Summarize key points in Dutch if the user speaks Dutch

## Applying video content to every prompt

If the user wants something from a video applied to every Claude interaction:
- Add it to `CLAUDE.md` in the project root (persists across sessions)
- Or add a hook to `.claude/settings.json` under `hooks.PreToolUse` or as a system prompt

## Current video request

For https://youtube.com/shorts/MkSJN_kK8L4:
- Network in this remote environment blocks YouTube directly
- Use Method 3 (WebSearch) to find what this video contains
- Or ask the user to paste the video content/transcript
- Once content is known, install it immediately
