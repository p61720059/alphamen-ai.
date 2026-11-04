# FILMATRIX AI — Free Cinematic Video Add-on

This add-on creates a 5- or 10-second WebM clip from one still image using browser canvas animation.
It does not generate new AI character/object motion. It uses no external API, API key, paid service,
or server-side video generation.

## Add it to your existing website

1. In your GitHub repository, open `index.html` and choose Edit (pencil).
2. Paste the contents of `free-video-section.html` where you want the new tool to appear.
3. In `index.html`, just before `</body>`, add:
   `<script src="free-video.js"></script>`
4. Upload `free-video.js` to the root of the repository (Add file → Upload files).
5. Commit the changes. Wait for GitHub Pages to publish, then reload the site.

## Android notes

- Use an updated Chrome browser.
- Export format is WebM; some gallery apps may not preview it. Try VLC or another WebM-compatible player.
- Longer clips, high-resolution images, or low-memory phones may fail. Start with a 5-second clip.
- This tool creates silent video. Add Telugu voice-over/music later in VN Video Editor.
