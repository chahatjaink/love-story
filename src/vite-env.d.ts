/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Google OAuth Web client ID (for Drive + Photos pickers) */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Google Cloud API key (Picker + Drive downloads; restrict by HTTP referrer) */
  readonly VITE_GOOGLE_API_KEY?: string;
  /** Google Cloud project number (Picker `setAppId`) */
  readonly VITE_GOOGLE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
