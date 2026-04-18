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

## Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Import the repo -- Vercel auto-detects Vite and configures the build
4. Add your `VITE_FIREBASE_*` env vars in Vercel project settings > Environment Variables
5. Done. You get a free `.vercel.app` URL with HTTPS

Custom domains are free on Vercel too.

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
