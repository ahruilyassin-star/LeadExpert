#!/usr/bin/env python3
"""
YouTube MCP Server
Provides tools to read YouTube video transcripts, metadata, and subtitles.
Run locally where YouTube is accessible, then add to Claude Code MCP config.
"""

import asyncio
import json
import re
import sys
import os
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from any YouTube URL format."""
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
        r"^([a-zA-Z0-9_-]{11})$",  # bare video ID
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_transcript(video_id: str, languages: list[str] = None) -> dict:
    """Fetch transcript using youtube-transcript-api."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api._errors import (
            TranscriptsDisabled,
            NoTranscriptFound,
            VideoUnavailable,
        )

        api = YouTubeTranscriptApi()
        lang_list = languages or ["nl", "en", "en-US", "en-GB"]

        try:
            transcript = api.fetch(video_id, languages=lang_list)
            entries = [{"start": e.start, "duration": e.duration, "text": e.text} for e in transcript]
            full_text = " ".join(e["text"] for e in entries)
            return {"success": True, "transcript": entries, "full_text": full_text, "source": "auto"}
        except Exception:
            # Try any available transcript
            transcript = api.fetch(video_id)
            entries = [{"start": e.start, "duration": e.duration, "text": e.text} for e in transcript]
            full_text = " ".join(e["text"] for e in entries)
            return {"success": True, "transcript": entries, "full_text": full_text, "source": "any"}

    except ImportError:
        return {"success": False, "error": "youtube-transcript-api not installed. Run: pip install youtube-transcript-api"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_video_info(video_id: str) -> dict:
    """Fetch video metadata using yt-dlp."""
    try:
        import subprocess
        result = subprocess.run(
            ["yt-dlp", "--dump-json", "--no-playlist", f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return {
                "success": True,
                "title": data.get("title", ""),
                "description": data.get("description", "")[:2000],
                "duration": data.get("duration", 0),
                "uploader": data.get("uploader", ""),
                "upload_date": data.get("upload_date", ""),
                "view_count": data.get("view_count", 0),
                "like_count": data.get("like_count", 0),
                "tags": data.get("tags", [])[:20],
                "categories": data.get("categories", []),
                "thumbnail": data.get("thumbnail", ""),
            }
        return {"success": False, "error": result.stderr[:500]}
    except FileNotFoundError:
        return {"success": False, "error": "yt-dlp not installed. Run: pip install yt-dlp"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_subtitles_via_ytdlp(video_id: str, lang: str = "nl,en") -> dict:
    """Download subtitle file via yt-dlp and return content."""
    try:
        import subprocess
        import tempfile
        import glob

        with tempfile.TemporaryDirectory() as tmpdir:
            result = subprocess.run(
                [
                    "yt-dlp",
                    "--write-auto-sub",
                    f"--sub-lang={lang}",
                    "--skip-download",
                    "--convert-subs=srt",
                    "-o", f"{tmpdir}/%(id)s.%(ext)s",
                    f"https://www.youtube.com/watch?v={video_id}",
                ],
                capture_output=True,
                text=True,
                timeout=60,
            )

            srt_files = glob.glob(f"{tmpdir}/*.srt") + glob.glob(f"{tmpdir}/*.vtt")
            if srt_files:
                with open(srt_files[0]) as f:
                    raw = f.read()
                # Strip SRT timing lines, keep only text
                lines = []
                for line in raw.splitlines():
                    line = line.strip()
                    if line and not re.match(r"^\d+$", line) and "-->" not in line:
                        # Remove HTML tags from VTT
                        line = re.sub(r"<[^>]+>", "", line)
                        if line:
                            lines.append(line)
                return {"success": True, "full_text": " ".join(lines), "raw": raw[:5000]}

            return {"success": False, "error": f"No subtitles found. yt-dlp output: {result.stderr[:300]}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# --- MCP Server ---

app = Server("youtube-mcp")


@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="youtube_transcript",
            description=(
                "Fetch the full transcript/subtitles of a YouTube video. "
                "Accepts any YouTube URL format (watch, shorts, youtu.be) or bare video ID. "
                "Returns timestamped entries and full plain text."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "YouTube URL or video ID (e.g. https://youtu.be/abc123 or abc123)",
                    },
                    "languages": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Preferred transcript languages in order (default: ['nl', 'en'])",
                        "default": ["nl", "en"],
                    },
                },
                "required": ["url"],
            },
        ),
        Tool(
            name="youtube_info",
            description=(
                "Get metadata for a YouTube video: title, description, duration, "
                "uploader, view count, tags, upload date."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "YouTube URL or video ID",
                    },
                },
                "required": ["url"],
            },
        ),
        Tool(
            name="youtube_read",
            description=(
                "All-in-one: fetch both metadata AND transcript for a YouTube video. "
                "Tries multiple methods (transcript API, then yt-dlp subtitles) for best coverage. "
                "Use this as the primary tool to 'read' or 'watch' a YouTube video."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "YouTube URL or video ID",
                    },
                    "languages": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Preferred transcript languages (default: ['nl', 'en'])",
                        "default": ["nl", "en"],
                    },
                },
                "required": ["url"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    url = arguments.get("url", "")
    languages = arguments.get("languages", ["nl", "en"])

    video_id = extract_video_id(url)
    if not video_id:
        return [TextContent(type="text", text=f"ERROR: Could not extract video ID from: {url}")]

    if name == "youtube_transcript":
        result = get_transcript(video_id, languages)
        if result["success"]:
            out = f"# Transcript for {video_id}\n\n"
            out += f"**Full text:**\n{result['full_text']}\n\n"
            if result.get("transcript"):
                out += "\n**Timestamped entries:**\n"
                for e in result["transcript"][:50]:
                    mins = int(e["start"] // 60)
                    secs = int(e["start"] % 60)
                    out += f"[{mins:02d}:{secs:02d}] {e['text']}\n"
        else:
            # Fallback to yt-dlp subtitles
            result2 = get_subtitles_via_ytdlp(video_id, ",".join(languages))
            if result2["success"]:
                out = f"# Subtitles for {video_id} (via yt-dlp)\n\n{result2['full_text']}"
            else:
                out = f"ERROR: Could not fetch transcript.\n- API error: {result['error']}\n- yt-dlp error: {result2['error']}"
        return [TextContent(type="text", text=out)]

    elif name == "youtube_info":
        result = get_video_info(video_id)
        if result["success"]:
            out = f"# Video Info: {result['title']}\n\n"
            out += f"- **Uploader:** {result['uploader']}\n"
            out += f"- **Duration:** {result['duration']}s\n"
            out += f"- **Views:** {result['view_count']:,}\n"
            out += f"- **Upload date:** {result['upload_date']}\n"
            out += f"- **Tags:** {', '.join(result['tags'][:10])}\n\n"
            out += f"**Description:**\n{result['description']}"
        else:
            out = f"ERROR fetching video info: {result['error']}"
        return [TextContent(type="text", text=out)]

    elif name == "youtube_read":
        parts = []

        # Get info
        info = get_video_info(video_id)
        if info["success"]:
            parts.append(f"# {info['title']}\n")
            parts.append(f"**Uploader:** {info['uploader']} | **Duration:** {info['duration']}s | **Views:** {info.get('view_count', 0):,}")
            if info.get("description"):
                parts.append(f"\n**Description:**\n{info['description'][:1000]}")
        else:
            parts.append(f"(Could not fetch metadata: {info['error']})")

        # Get transcript
        transcript = get_transcript(video_id, languages)
        if transcript["success"]:
            parts.append(f"\n## Transcript\n\n{transcript['full_text']}")
        else:
            sub = get_subtitles_via_ytdlp(video_id, ",".join(languages))
            if sub["success"]:
                parts.append(f"\n## Subtitles (yt-dlp)\n\n{sub['full_text']}")
            else:
                parts.append(f"\n(No transcript available: {transcript['error']})")

        return [TextContent(type="text", text="\n".join(parts))]

    return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
