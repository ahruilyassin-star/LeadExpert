---
name: scroll-cinematic
description: Build a high-end, 3D scroll-driven cinematic website. Generates a cinematic hero plus 3D video clips with the Higgsfield MCP, slices the footage into scroll frames, and assembles a polished, branded multi-section site where scrolling scrubs the video frame-by-frame — then serves it on localhost. Use when the user asks for a "scroll-cinematic" / "3D scroll" / "scrollytelling" / "cinematic scroll" website, a frame-by-frame scroll video site (Apple-AirPods style), or a branded animated landing page driven by scroll.
---

# Scroll-Cinematic Website Builder

Build the kind of immersive landing page where scrolling scrubs a cinematic
video frame-by-frame (the "Apple AirPods Pro" effect), wrapped in a polished,
branded multi-section site.

## When to use

Trigger this skill when the user wants any of:
- A "scroll-cinematic", "3D scroll", "cinematic scroll", or "scrollytelling" site
- A frame-by-frame scroll-scrubbed hero video
- A branded animated landing page where scroll drives the motion
- A high-end product/brand hero generated from a text prompt

## Inputs to confirm first

Before generating anything, lock down (ask only if missing — otherwise infer
sensible defaults and state them):

1. **Subject / brand** — what the site is for (product, brand, story).
2. **Vibe** — cinematic mood (e.g. "warm, premium, Islamic geometric",
   "dark luxury", "soft pastel kids").
3. **Brand colors / fonts** — if a repo/brand exists, pull from it; else propose.
4. **Sections** — default: Hero (scroll-video) → Features → Showcase (2nd clip)
   → CTA → Footer.
5. **Resolution** — default 1080p for clips (1920×1080), 60–120 sliced frames
   per scroll sequence.

## Workflow

### Step 1 — Generate the cinematic media (Higgsfield MCP)

Use the `mcp__higgsfield__*` tools. Check the connected workspace and credits
first if unsure (`mcp__higgsfield__balance` / `mcp__higgsfield__show_plans_and_credits`).

1. **Hero clip** — `mcp__higgsfield__generate_video` with a cinematic,
   slow-camera-move prompt at 1080p. Favor smooth dolly/orbit motion (it slices
   into clean scroll frames). Avoid fast cuts.
2. **Two 3D showcase clips** — generate two more `generate_video` (or
   `generate_3d` for 3D assets) clips that match the established vibe.
3. Poll with `mcp__higgsfield__job_display` / `show_generations` until ready,
   then download the resulting MP4s into `assets/video/`.

Prompt-writing tips for clean scroll frames:
- One continuous camera move, constant speed, no scene changes.
- Subject centered, generous negative space for overlay text.
- Consistent lighting across the clip.

### Step 2 — Slice video into scroll frames (ffmpeg)

Each cinematic clip becomes a numbered image sequence the browser preloads and
draws to a canvas as the user scrolls.

```bash
# Extract ~120 evenly-spaced JPG frames from a clip
mkdir -p assets/frames/hero
ffmpeg -i assets/video/hero.mp4 -vf "fps=24,scale=1920:-1" -q:v 3 \
  assets/frames/hero/frame_%04d.jpg
```

Guidelines:
- 60–120 frames per sequence is the sweet spot (smooth vs. payload).
- Keep frames ≤ 1920px wide, JPG q:v 3–5, to keep total weight reasonable.
- One subfolder per clip (`hero/`, `showcase1/`, `showcase2/`).

If ffmpeg isn't installed, install it (`apt-get install -y ffmpeg` / `brew
install ffmpeg`) or fall back to playing the MP4 inline with a scroll-synced
`currentTime` (see template notes).

### Step 3 — Build the branded multi-section site

Use the templates in `templates/` as the starting point:
- `templates/index.html` — section scaffold (hero + content sections).
- `templates/scroll-frames.js` — preloads the frame sequence and scrubs it on a
  `<canvas>` tied to scroll position, with `requestAnimationFrame` smoothing.
- `templates/styles.css` — sticky-canvas layout, sections, CSS variables for
  brand color/fonts.

Wire it up:
1. Set CSS variables (`--brand`, `--accent`, `--font`) to the brand palette.
2. Point each `data-frames` sequence at its folder + frame count.
3. Fill section copy to match the subject; add scroll-reveal on headings.
4. Keep it dependency-light (vanilla JS + canvas). Add GSAP/Lenis only if the
   user wants buttery smoothing.

Performance must-dos:
- Preload all frames before enabling scrub; show a slim loader bar.
- Use one sticky `<canvas>` per sequence sized to `devicePixelRatio`.
- Drive frame index from scroll progress, render in a rAF loop (never per scroll event).

### Step 4 — Launch on localhost

```bash
# Any static server works; pick what's available
python3 -m http.server 5173        # → http://localhost:5173
# or: npx serve .   |   npx vite
```

Open the URL, scroll-test the scrub on each sequence, and report the local URL
back to the user. If running headless, verify by cur/loading the page and
checking frames are reachable.

## Output

A self-contained folder (`index.html`, `styles.css`, `scroll-frames.js`,
`assets/`) that runs from any static server — committed if the user wants it
kept.

## Notes

- This is a creative/build skill: prefer making reasonable choices and showing
  the result over asking many questions.
- Respect brand assets already in the repo (logos, colors, fonts) when present.
- The Higgsfield MCP must be connected. If it isn't, tell the user and offer to
  proceed with placeholder/stock footage so the scroll mechanics still demo.
