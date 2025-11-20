# DVD Game

This is a small static web game (HTML/CSS/JS) — a DVD-style bouncing text clicker game.

How to run locally

1. Open this folder in VS Code.
2. Start Live Server (click "Go Live") or open `index.html` in a browser.

Prepare and deploy (recommended: Netlify)

1. Initialize a git repo and push to GitHub:

```bash
git init
git add .
git commit -m "Initial dvd game site"
# create a GitHub repo and add the remote
git remote add origin https://github.com/YOURNAME/dvd-game.git
git push -u origin main
```

2. Create a Netlify site by connecting the GitHub repo or drag-and-drop the folder to Netlify.
3. Add your custom domain (e.g. `dvd-game.com`) in Netlify and follow the DNS instructions. Netlify will provide HTTPS automatically.

Alternative hosts: Vercel, GitHub Pages, or a VPS with Nginx + Certbot.

Notes

- The game files are `index.html` and `Script.js`.
- Use `mkcert` if you need HTTPS on localhost for testing.
