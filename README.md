# Digital Twin

This repository contains a static 3D Compass webpage intended to be hosted on GitHub Pages.

## Project File

- `index.html` - main page served by GitHub Pages.

## Run Locally

Open `index.html` in your browser, or serve the folder with a simple static server.

Example with Python:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open **Settings -> Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)`
4. Save and wait for deployment.

Your site URL will be:

`https://<your-username>.github.io/<your-repo>/`
