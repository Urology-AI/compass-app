# COMPASS

Static **COMPASS** digital-twin web app (single-page, Three.js). This repo is **`Urology-AI/compass-app`**.

## Live site (GitHub Pages)

After deployment finishes, the app is served at:

**https://urology-ai.github.io/compass-app/**

If that URL 404s, confirm the workflow run succeeded (see below) and that Pages is configured to use **GitHub Actions**.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy (GitHub Actions)

Deployment runs automatically on every push to `main` via [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

### One-time setup on GitHub

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` or run the workflow manually: **Actions → Deploy static content to Pages → Run workflow**.

### Check that it worked

- **Actions** tab: the latest **Deploy static content to Pages** run should be green.
- Open the run → **deploy** job → the **Deploy to GitHub Pages** step shows the published URL.

## Repository layout

| Path | Purpose |
|------|---------|
| `index.html` | Full app (UI, logic, embedded data handling). |
| `.github/workflows/pages.yml` | Builds a minimal `_site` with `index.html` and publishes to Pages. |

## Remote

```bash
git remote -v
# origin  git@github.com:Urology-AI/compass-app.git
```
