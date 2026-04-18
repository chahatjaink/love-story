const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';
const GAPI_SCRIPT = 'https://apis.google.com/js/api.js';

export const GOOGLE_PICKER_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
].join(' ');

function scriptLoaded(src: string): boolean {
  return Boolean(document.querySelector(`script[src="${src}"]`));
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded(src)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(el);
  });
}

let gapiPickerReady = false;

export function googlePickerConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
      import.meta.env.VITE_GOOGLE_API_KEY &&
      import.meta.env.VITE_GOOGLE_APP_ID,
  );
}

export function getGooglePickerConfig(): { clientId: string; apiKey: string; appId: string } {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const appId = import.meta.env.VITE_GOOGLE_APP_ID;
  if (!clientId || !apiKey || !appId) {
    throw new Error(
      'Google import is not configured. Add VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY, and VITE_GOOGLE_APP_ID to .env (see README).',
    );
  }
  return { clientId, apiKey, appId };
}

export async function ensureGooglePickerLibs(): Promise<void> {
  await Promise.all([injectScript(GIS_SCRIPT), injectScript(GAPI_SCRIPT)]);
  if (gapiPickerReady) return;
  const gapi = (window as unknown as { gapi?: { load: (lib: string, opts: { callback: () => void; onerror?: () => void }) => void } })
    .gapi;
  if (!gapi) {
    throw new Error('Google API loader did not expose gapi.');
  }
  await new Promise<void>((resolve, reject) => {
    gapi.load('picker', {
      callback: () => {
        gapiPickerReady = true;
        resolve();
      },
      onerror: () => reject(new Error('Failed to load Google Picker library.')),
    });
  });
}

type TokenResponse = { access_token?: string; error?: string; error_description?: string };

export async function requestGooglePickerAccessToken(): Promise<string> {
  await injectScript(GIS_SCRIPT);
  const { clientId } = getGooglePickerConfig();
  return new Promise((resolve, reject) => {
    const oauth2 = (
      window as unknown as {
        google?: {
          accounts?: {
            oauth2?: {
              initTokenClient: (opts: {
                client_id: string;
                scope: string;
                callback: (r: TokenResponse) => void;
              }) => { requestAccessToken: () => void };
            };
          };
        };
      }
    ).google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error('Google Identity Services did not load.'));
      return;
    }
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_PICKER_SCOPES,
      callback: (resp: TokenResponse) => {
        if (resp.error) {
          reject(new Error(resp.error_description || resp.error));
          return;
        }
        if (resp.access_token) {
          resolve(resp.access_token);
          return;
        }
        reject(new Error('Sign-in was cancelled or no access token was returned.'));
      },
    });
    client.requestAccessToken();
  });
}
