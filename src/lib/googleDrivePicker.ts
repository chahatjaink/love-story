import { ensureGooglePickerLibs, getGooglePickerConfig, requestGooglePickerAccessToken } from './googleAccess';

function downloadDriveFile(accessToken: string, doc: google.picker.DocumentObject): Promise<File> {
  const id = doc[google.picker.Document.ID];
  if (!id) {
    return Promise.reject(new Error('Missing Drive file id.'));
  }
  const name = doc[google.picker.Document.NAME] || `photo-${id}`;
  const mime = doc[google.picker.Document.MIME_TYPE] || 'image/jpeg';
  return fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).then(async (res) => {
    if (!res.ok) {
      throw new Error(`Could not download from Google Drive (${res.status}).`);
    }
    const blob = await res.blob();
    return new File([blob], name, { type: mime || blob.type || 'image/jpeg' });
  });
}

/** Opens the Google Drive file picker (images, multi-select). Returns `File` blobs for upload. */
export async function pickImagesFromGoogleDrive(): Promise<File[]> {
  await ensureGooglePickerLibs();
  const { apiKey, appId } = getGooglePickerConfig();
  const token = await requestGooglePickerAccessToken();

  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(false)
      .setMimeTypes(
        'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/heic,image/heif,image/bmp,image/tiff',
      );

    const picker = new google.picker.PickerBuilder()
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
      .addView(view)
      .setCallback((data: google.picker.ResponseObject) => {
        const action = data[google.picker.Response.ACTION];
        const docs = data[google.picker.Response.DOCUMENTS];
        if (action === google.picker.Action.PICKED && docs?.length) {
          void Promise.all(docs.map((d) => downloadDriveFile(token, d)))
            .then(resolve)
            .catch(reject);
        } else if (action === google.picker.Action.CANCEL) {
          resolve([]);
        } else if (action === google.picker.Action.ERROR) {
          reject(new Error('Google Drive picker reported an error.'));
        }
      })
      .build();
    picker.setVisible(true);
  });
}
