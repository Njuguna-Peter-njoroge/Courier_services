# Vercel Deployment Instructions for Angular (in /Frontend)

1. The Angular app is located in the `Frontend/` directory.
2. The build output is in `Frontend/dist/Frontend/browser`.
3. Vercel is configured to use this output directory and serve `index.html` for all routes (SPA).

## Vercel Settings
- **Build Command:**
  ```sh
  cd Frontend && npm install && npm run build
  ```
- **Output Directory:**
  ```
  dist/Frontend/browser
  ```

## Project Structure
```
/Frontend
  /dist/Frontend/browser  <-- built app
  /src                    <-- source code
  angular.json
  package.json
  ...
/vercel.json              <-- Vercel config (at repo root)
```

## Troubleshooting 404 Errors
- Ensure the build command and output directory are set as above in Vercel dashboard.
- The `/vercel.json` at the root ensures all routes are rewritten to `index.html` for SPA routing.
- If you change the Angular project name, update the output directory accordingly.
