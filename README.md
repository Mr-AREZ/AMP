# AREZ Music Player (AMP)

A modern, minimal, and fully responsive music player built with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build step. Designed to be clean, portfolio-ready, and easy to deploy on **GitHub Pages**.

## Features (v1 — MVP)

- Album cover, track title, and artist display
- Play / Pause
- Next / Previous track
- Seek bar with current time and total duration
- Volume control with mute toggle
- Interactive playlist with per-track durations and an active-track equalizer animation
- Shuffle and Repeat (off / all / one)
- Dark and Light themes with system-preference detection and persistence
- Keyboard shortcuts
- Fully responsive layout (mobile-first)

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `→` / `←` | Seek +/- 5s |
| `Shift + →` / `Shift + ←` | Next / Previous track |
| `↑` / `↓` | Volume up / down |
| `M` | Mute / Unmute |

## Project Structure

```
.
├── index.html            # Markup and layout
├── css/
│   └── style.css         # Design tokens (Dark/Light) and styles
├── js/
│   ├── tracks.js         # Playlist data
│   ├── theme.js          # Theme controller
│   └── player.js         # Core player logic
└── assets/
    └── covers/           # Album cover art
```

## Using Your Own Tracks

Demo audio uses royalty-free [SoundHelix](https://www.soundhelix.com/) samples. To use your own songs, drop `.mp3` files into `assets/audio/` and edit `js/tracks.js`:

```js
const TRACKS = [
  {
    title: "My Song",
    artist: "My Artist",
    cover: "assets/covers/my-cover.png",
    src: "assets/audio/my-song.mp3",
  },
];
```

## Running Locally

Because the player fetches audio and images, serve the folder over HTTP rather than opening the file directly:

```bash
npx serve .
# or
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set the source to your default branch (root).
4. Your player will be live at `https://<username>.github.io/<repo>/`.

The included `.nojekyll` file ensures all assets are served correctly.

## License

Free to use for personal and portfolio projects.
