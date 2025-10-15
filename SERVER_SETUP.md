# Server Setup for Client-Side Routing

Your site now uses proper routes like `/about` instead of hash routes like `/#about`. For this to work, your server needs to serve `index.html` for all routes.

## Why is this needed?

When someone visits `loganbnielsen.com/about` directly:
- The browser asks the server for `/about`
- Without configuration, the server returns a 404 error
- With configuration, the server returns `index.html`, which then shows the about screen

---

## 💻 Local Development (START HERE!)

**Live Server doesn't support SPA routing!** It can't handle `/about` routes.

### ✅ Use the Included Dev Server (Recommended)

A simple Node.js server (`server.js`) is included that handles routing:

```bash
# From the website directory, run:
node server.js

# Or use your package manager:
npm start
# or
pnpm start
# or
yarn start
```

Then visit:
- http://localhost:8000/ → Terminal
- http://localhost:8000/about → About page

**Both routes will work perfectly!**

### Alternative Options

**Python 3 (if you have it):**
```bash
python -m http.server 8000
```
⚠️ Note: This won't handle `/about` routes properly either.

**http-server with SPA mode:**
```bash
npm install -g http-server
http-server -p 8000 --proxy http://localhost:8000?
```

---

## Setup Instructions by Hosting Platform

### 🌐 Netlify (Recommended for static sites)
✅ **Already configured!** The `_redirects` file is included.

Just deploy and it will work automatically.

---

### ▲ Vercel
✅ **Already configured!** The `vercel.json` file is included.

Just deploy and it will work automatically.

---

### 🔥 Firebase Hosting
Create or update `firebase.json`:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

### 🪶 Apache Server (cPanel, shared hosting)
✅ **Already configured!** The `.htaccess` file is included.

Make sure `mod_rewrite` is enabled on your server.

---

### 🔷 Nginx
Add this to your nginx config:

```nginx
server {
    listen 80;
    server_name loganbnielsen.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then restart nginx:
```bash
sudo systemctl restart nginx
```

---

### 🐙 GitHub Pages
**Note:** GitHub Pages doesn't support server-side rewrites for SPAs out of the box.

**Option 1:** Use hash routing (already works, change back to `#about`)

**Option 2:** Use the 404 trick:
1. Copy `index.html` to `404.html`
2. GitHub will serve `404.html` for missing routes
3. Your JavaScript will handle the routing

---

## Testing

After setup, test these URLs:
- `yoursite.com/` → Should show terminal
- `yoursite.com/about` → Should show about screen directly
- Navigate between them and use browser back button

## Current Files

The following configuration files are included in your project:
- `_redirects` - For Netlify
- `vercel.json` - For Vercel  
- `.htaccess` - For Apache servers

Choose the one that matches your hosting platform!

