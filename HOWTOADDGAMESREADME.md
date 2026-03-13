# How to Add New Games in the Portal

This guide explains how to add a new web game to the STEM Game Portal using the metadata-driven setup.

## Overview
The portal is designed for scalability. New games are defined in a central metadata file and automatically routed through a shared dynamic page system, eliminating the need to build unique pages for every entry.

**The Workflow:**
1.  Add game metadata to the central registry.
2.  Upload the thumbnail image.
3.  Verify the live game URL.
4.  (Optional) Feature it on the homepage.

---

## Folder Structure
Ensure your files are placed in the following directories:

```text
src/
  app/
    page.tsx            # Homepage
    games/
      [slug]/
        page.tsx        # Dynamic Game Template
  components/
    GameEmbed.tsx       # Iframe Wrapper
  data/
    games.ts            # <--- ADD METADATA HERE
public/
  images/               # <--- ADD THUMBNAILS HERE
```

---

## Step 1: Add Game Metadata
Open `src/data/games.ts` and add a new object to the `games` array.

### Field Definitions
| Field | Description | Example |
| :--- | :--- | :--- |
| `slug` | Unique ID used in the URL route. | `matrix-meadow` |
| `title` | Display name for cards and headers. | `Matrix Meadow Academy` |
| `subject` | Category (Science, Technology, Engineering, Math). | `Mathematics` |
| `description` | Short summary for previews. | `Practice matrix multiplication...` |
| `iframeSrc` | The live URL of the hosted game. | `https://game-url.vercel.app` |
| `thumbnailSrc` | Path to the image in `/public/images`. | `/images/thumb.png` |
| `embedHeight` | (Optional) Custom height for the iframe. | `800px` |
| `featured` | (Optional) Boolean to pin to homepage. | `true` |

### Example Entry
```typescript
{
  slug: "matrix-meadow",
  title: "Matrix Meadow Academy",
  subject: "Mathematics",
  description: "Practice matrix multiplication through interactive challenges.",
  iframeSrc: "https://your-game-url-here.vercel.app",
  thumbnailSrc: "/images/matrix-meadow-thumb.png",
  embedHeight: "800px",
  featured: true,
}
```

---

## Step 2: Add the Thumbnail Image
Place your image in `public/images/`.
* **Recommended Size:** 1280 x 720 (16:9 aspect ratio).
* **Format:** PNG or WebP preferred.

---

## Step 3: Hosting & Security
The portal uses `<iframe>` tags to embed games.
> [!IMPORTANT]
> Some hosts block embedding via **X-Frame-Options** or **Content-Security-Policy** headers. If the game doesn't load, ensure the hosting provider allows your portal's domain to embed the content.

---

## Step 4: Testing & Display
Once the metadata is saved, the game is automatically live at:
`yourdomain.com/games/[slug]`

### Showing Games on the Homepage
To scale effectively, the homepage should render sections dynamically based on the `subject` field:

```typescript
const mathGames = games.filter((game) => game.subject === "Mathematics");
```

---

## ✅ Checklist
- [ ] Unique `slug` defined in `games.ts`.
- [ ] Thumbnail exists in `public/images/` and matches `thumbnailSrc`.
- [ ] `iframeSrc` is a valid, live URL.
- [ ] Game loads correctly at its dynamic route.
- [ ] Host security headers allow iframe embedding.

## ⚠️ Common Issues
* **Broken Image:** Check if the path in `thumbnailSrc` starts with a leading slash (e.g., `/images/...`).
* **Blank Iframe:** Check the browser console for "Refused to display in a frame" errors (Security header issue).
* **404 Error:** Ensure the `slug` in the URL matches the `slug` in `games.ts` exactly.
