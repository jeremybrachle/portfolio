# Portfolio Deploy — AWS Status

> Detailed AWS plan lives in [HANDOFF_2025-04-17.md](HANDOFF_2025-04-17.md).
> This file tracks what is **done in code** vs what still needs to happen in the AWS console / GitHub.

## ✅ Code-side: ready to deploy

- [x] **Production build works** — `npm run build` produces a clean `dist/` (verified). Static `js/` lives in `public/js/`.
- [x] **CSP meta tag** in `index.html` — locks `default-src 'self'`, restricts `connect-src` to HN + GitHub APIs, blocks `object-src`.
- [x] **Inline favicon** (🎧 SVG emoji) on `index.html` and all `pages/*.html`.
- [x] **Open Graph + Twitter card** meta tags on `index.html`.
- [x] **HN data sanitization** — `safeUrl`, `safeInt`, `clampStr`, `isValidHnId` in `public/js/vibe-check.js`. Anchors get `rel="noopener noreferrer nofollow ugc"`.
- [x] **postMessage hardening** — both `public/js/player.js` and `public/vibe-machine/portfolio-embed.js` validate `origin` and `source`, reject malformed payloads.
- [x] **Vite SPA mode** configured.
- [x] **GitHub Actions workflow** at `.github/workflows/deploy.yml` (placeholders need replacing — see below).
- [x] **CloudFront response headers policy** template at `aws/cloudfront-response-headers.json`.

## 🟡 Optional polish (not blocking)

- [ ] **Clair de Lune MP3** — drop a public-domain recording at `public/audio/clair-de-lune.mp3`. Without it the home audio control is dead, but the rest of the site works.
- [ ] **Open Graph image** — currently points at `/screenshots/vibe-machine/vibe-demo-screenshot.png` (1.5MB). Consider creating a 1200×630 social card.
- [ ] **Responsive pass** at 375 / 768 px.
- [ ] Move 8 inline `<script>` blocks in `index.html` into separate files so we can drop `'unsafe-inline'` from `script-src`.

---

## 🔴 What you still need to do in AWS / GitHub

### 1. AWS resources (one-time, console)
1. **S3 bucket** `jeremybrachle-portfolio` — block all public access, enable versioning.
2. **CloudFront distribution** with the bucket as origin via **OAC** (not legacy OAI).
   - Default root object: `index.html`
   - **Custom error responses (SPA fallback):**
     - `403 → /index.html`, response code `200`
     - `404 → /index.html`, response code `200`
   - Enable Brotli/gzip compression
   - Default cache behavior: `CachingOptimized`
3. **Response headers policy** — apply `aws/cloudfront-response-headers.json` (HSTS, X-CTO, Referrer-Policy, Permissions-Policy, X-Frame-Options).
4. **IAM OIDC provider** for `token.actions.githubusercontent.com` (audience `sts.amazonaws.com`).
5. **IAM role** `github-actions-portfolio-deploy` — see `HANDOFF_2025-04-17.md` for trust + inline policy JSON. Restrict the `sub` condition to `repo:jeremybrachle/portfolio:ref:refs/heads/main`.

### 2. Wire up the workflow
Edit `.github/workflows/deploy.yml` and replace:
- `S3_BUCKET` → your real bucket name (only if different)
- `CLOUDFRONT_DISTRIBUTION_ID` → distribution ID from CloudFront
- `DEPLOY_ROLE` → role ARN with your account ID

### 3. Push and verify
```bash
git push origin main
```
Then visit the `*.cloudfront.net` URL. Check:
- [ ] All five projects load
- [ ] Mini-player audio survives navigation between sections
- [ ] Refreshing on `/section-vibecheck` (or any deep route) doesn't 404 — SPA fallback should serve `index.html`
- [ ] HN stories load on the Vibe Check section
- [ ] `/vibe-machine/index.html` (the standalone iframe demo) loads
- [ ] DevTools Console shows no CSP violations

### 4. Optional: custom domain
- Request ACM cert in `us-east-1`
- Add CNAME / Route 53 alias to the distribution
- Add the alternate domain in CloudFront

---

## Local commands

```bash
# All commands run from WSL — Windows can't exec the WSL-installed binaries
cd /home/kerry/programming/portfolio

npm install          # first time only
npm run dev          # dev → http://localhost:4000
npm run build        # production build → dist/
npx vite preview     # preview production bundle
```

---

## Architecture reminder

```
GitHub push (main) → Actions → npm run build → S3 sync → CloudFront invalidation
                                  │
                                  └─ HTML: no-cache (deploys propagate instantly)
                                  └─ Hashed assets: 1-year immutable
                                  └─ vibe-machine/* (unhashed): 5-min cache
```
