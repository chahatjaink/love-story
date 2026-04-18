# Our Love Story

A romantic PWA for couples. Fill in your details, upload photos, and enjoy a beautiful display with a live relationship timer, photo carousel, and background music.

## Quick Start

```bash
npm install
cp .env.example .env    # then fill in your Firebase credentials
npm run dev
```

## Adding Your Songs

Drop your 5 MP3 files into `public/songs/`:

```
public/songs/song1.mp3
public/songs/song2.mp3
public/songs/song3.mp3
public/songs/song4.mp3
public/songs/song5.mp3
```

Edit `src/config/songs.ts` to set display titles:

```ts
export const playlist = [
  { title: "Perfect - Ed Sheeran", src: "/songs/song1.mp3" },
  { title: "All of Me - John Legend", src: "/songs/song2.mp3" },
  // ...
];
```

## Firebase Setup (Free)

The app uses Firebase to store love stories so you can share them via link.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (free Spark plan)
2. **Firestore**: Go to Build > Firestore Database > Create database > Start in **test mode**
3. **Storage**: Go to Build > Storage > Get started > Start in **test mode**
4. **Web app config**: Go to Project Settings (gear icon) > General > scroll to "Your apps" > click the web icon (`</>`) > register an app > copy the config object
5. Create a `.env` file in the project root (copy from `.env.example`) and fill in the values:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Free tier limits: 1 GiB Firestore, 5 GB Storage, 1 GB/day downloads. More than enough for personal use.

## Optional: Google Drive & Google Photos import

The form can add **many** photos from this device, or (when configured) from **Google Drive** (in-browser picker, multi-select) and **Google Photos** (opens Google’s picker in a new tab; videos are skipped).

1. In [Google Cloud Console](https://console.cloud.google.com/), pick the same project as Firebase (or any project).
2. **APIs & Services > Library**: enable **Google Picker API**, **Google Drive API**, and **Photos Picker API**.
3. **APIs & Services > Credentials**:
   - Create an **OAuth 2.0 Client ID** (Application type: **Web application**). Add **Authorized JavaScript origins** for local dev (`http://localhost:5173`) and your production URL.
   - Create an **API key**. Under key restrictions, use **HTTP referrers** and allow the same origins (and paths if you use path-based deploys).
4. **IAM & Admin > Settings** (or Cloud Console home): copy the **Project number** (digits only).
5. Add to `.env` (see `.env.example`):

```
VITE_GOOGLE_CLIENT_ID=....apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIza...
VITE_GOOGLE_APP_ID=123456789012
```

There is **no app-enforced cap** on how many photos you attach. Google’s own pickers allow large batches (Photos Picker documents up to **2000** items per session). Firebase Storage and Firestore still have **quota and cost** limits on your Google Cloud plan—watch usage if someone uploads a huge library.

## Deploy to Vercel (Free)

**1. Create a GitHub repo** (empty, no README) and push this project:

```bash
cd /path/to/gf
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**2. Import on Vercel**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Add New Project** > import your repo
3. Framework Preset: **Vite** (auto-detected), Build: `npm run build`, Output: `dist`
4. **Environment Variables**: add every key from `.env.example` (copy values from your local `.env` -- do not commit `.env`)
5. **Deploy**

You get `https://YOUR_PROJECT.vercel.app`. Share links will use that domain automatically.

After the first deploy, every `git push` to `main` redeploys in about a minute.

Custom domains: Vercel project **Settings > Domains** (free).

## Future: Native iOS & Android Apps

Wrap the same codebase with Capacitor -- zero rewrite:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Our Love Story" com.ourlove.story
npx cap add ios
npx cap add android
npm run build && npx cap sync
npx cap open ios       # Opens Xcode
npx cap open android   # Opens Android Studio
```

Costs: Apple Developer ($99/yr), Google Play ($25 one-time).

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- Howler.js
- Firebase (Firestore + Storage)
- vite-plugin-pwa
