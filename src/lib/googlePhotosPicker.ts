import { requestGooglePickerAccessToken } from './googleAccess';

const API = 'https://photospicker.googleapis.com/v1';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseDurationToMs(d: string | undefined, fallback: number): number {
  if (!d) return fallback;
  const m = /^([\d.]+)s$/i.exec(d.trim());
  if (!m) return fallback;
  const n = Number(m[1]);
  if (n === 0) return 0;
  return Math.max(250, Math.round(n * 1000));
}

interface PickingSession {
  id?: string;
  pickerUri?: string;
  mediaItemsSet?: boolean;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
}

interface MediaFile {
  baseUrl?: string;
  mimeType?: string;
}

interface ListedMediaItem {
  id?: string;
  mediaFile?: MediaFile;
  mimeType?: string;
  baseUrl?: string;
}

function withAutoclose(pickerUri: string): string {
  try {
    const u = new URL(pickerUri);
    const path = u.pathname.replace(/\/?$/, '');
    u.pathname = `${path}/autoclose`;
    return u.toString();
  } catch {
    return pickerUri.replace(/\/?$/, '') + '/autoclose';
  }
}

function baseUrlForItem(item: ListedMediaItem): string | undefined {
  return item.mediaFile?.baseUrl ?? item.baseUrl;
}

function mimeForItem(item: ListedMediaItem): string {
  return item.mediaFile?.mimeType ?? item.mimeType ?? 'image/jpeg';
}

async function pollUntilPicked(accessToken: string, sessionId: string): Promise<void> {
  const started = Date.now();
  let intervalMs = 2000;
  let deadline = started + 12 * 60 * 1000;

  for (;;) {
    const res = await fetch(`${API}/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Photos session failed (${res.status}): ${text}`);
    }
    const body = (await res.json()) as PickingSession;
    if (body.mediaItemsSet) return;

    if (body.pollingConfig?.pollInterval) {
      intervalMs = parseDurationToMs(body.pollingConfig.pollInterval, intervalMs);
    }
    if (body.pollingConfig?.timeoutIn !== undefined) {
      const t = parseDurationToMs(body.pollingConfig.timeoutIn, 12 * 60 * 1000);
      if (t === 0) {
        throw new Error('Google Photos closed this picker session.');
      }
      deadline = started + t;
    }

    if (Date.now() > deadline) {
      throw new Error('Google Photos picker timed out. Try again.');
    }
    await sleep(intervalMs);
  }
}

async function listAllMediaItems(accessToken: string, sessionId: string): Promise<ListedMediaItem[]> {
  const out: ListedMediaItem[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ sessionId, pageSize: '100' });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${API}/mediaItems?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Could not list Google Photos picks (${res.status}): ${text}`);
    }
    const body = (await res.json()) as { mediaItems?: ListedMediaItem[]; nextPageToken?: string };
    if (body.mediaItems?.length) out.push(...body.mediaItems);
    pageToken = body.nextPageToken;
  } while (pageToken);
  return out;
}

async function downloadPickedImage(
  accessToken: string,
  item: ListedMediaItem,
  index: number,
): Promise<File | null> {
  const mime = mimeForItem(item);
  if (mime.startsWith('video/')) {
    return null;
  }
  const base = baseUrlForItem(item);
  if (!base) return null;
  const url = `${base}=d`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    throw new Error(`Could not download a Google Photos image (${res.status}).`);
  }
  const blob = await res.blob();
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const name = item.id ? `photo-${item.id}.${ext}` : `google-photo-${index}.${ext}`;
  return new File([blob], name, { type: blob.type || mime });
}

async function deleteSession(accessToken: string, sessionId: string): Promise<void> {
  try {
    await fetch(`${API}/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    /* cleanup best-effort */
  }
}

/**
 * Opens Google Photos in a new tab (user picks there). Returns image files (videos are skipped).
 * Requires pop-ups allowed for this site.
 */
export async function pickImagesFromGooglePhotos(): Promise<File[]> {
  const accessToken = await requestGooglePickerAccessToken();

  const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
  if (!popup) {
    throw new Error('Pop-up was blocked. Allow pop-ups for this site to pick from Google Photos.');
  }

  let sessionId: string | undefined;
  try {
    const createRes = await fetch(`${API}/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`Could not start Google Photos picker (${createRes.status}): ${text}`);
    }
    const session = (await createRes.json()) as PickingSession;
    sessionId = session.id;
    const uri = session.pickerUri;
    if (!sessionId || !uri) {
      throw new Error('Google Photos returned an incomplete session.');
    }

    popup.location.href = withAutoclose(uri);

    await pollUntilPicked(accessToken, sessionId);

    const items = await listAllMediaItems(accessToken, sessionId);
    const files: File[] = [];
    let i = 0;
    for (const item of items) {
      const file = await downloadPickedImage(accessToken, item, i++);
      if (file) files.push(file);
    }
    return files;
  } catch (e) {
    try {
      popup.close();
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    if (sessionId) {
      void deleteSession(accessToken, sessionId);
    }
  }
}
