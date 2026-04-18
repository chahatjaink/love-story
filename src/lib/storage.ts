import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { CoupleData, Partner } from '../types';

interface StoredData {
  partner1: Partner;
  partner2: Partner;
  startDate: string;
  photoUrls: string[];
  createdAt: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  const dataUrl = await fileToBase64(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export async function saveLoveStory(
  data: { partner1: Partner; partner2: Partner; startDate: string },
  photoFiles: File[],
): Promise<string> {
  const docRef = doc(collection(db, 'stories'));
  const id = docRef.id;

  let photoUrls: string[] = [];
  let useStorage = true;

  try {
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const storageRef = ref(storage, `stories/${id}/photo_${i}`);
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('storage_timeout')), 15000),
      );
      await Promise.race([uploadPromise, timeoutPromise]);
      const url = await getDownloadURL(storageRef);
      photoUrls.push(url);
    }
  } catch (err) {
    console.warn('Firebase Storage failed, falling back to inline base64:', err);
    useStorage = false;
    photoUrls = [];
    for (const file of photoFiles) {
      const compressed = await compressImage(file);
      photoUrls.push(compressed);
    }
  }

  const stored: StoredData = {
    partner1: data.partner1,
    partner2: data.partner2,
    startDate: data.startDate,
    photoUrls,
    createdAt: Date.now(),
  };

  if (useStorage) {
    await setDoc(docRef, stored);
  } else {
    const mainDoc = { ...stored, photoUrls: [] as string[] };
    await setDoc(docRef, mainDoc);
    for (let i = 0; i < photoUrls.length; i++) {
      await setDoc(doc(db, 'stories', id, 'photos', `photo_${i}`), {
        data: photoUrls[i],
        order: i,
      });
    }
  }

  return id;
}

export async function loadLoveStory(id: string): Promise<CoupleData | null> {
  const docRef = doc(db, 'stories', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const d = snap.data() as StoredData;

  let photos = d.photoUrls;
  if (photos.length === 0) {
    const { getDocs: getSubDocs, collection: subCollection, query, orderBy } = await import('firebase/firestore');
    const photosSnap = await getSubDocs(query(subCollection(db, 'stories', id, 'photos'), orderBy('order')));
    photos = photosSnap.docs.map((doc) => doc.data().data as string);
  }

  return {
    partner1: d.partner1,
    partner2: d.partner2,
    startDate: d.startDate,
    photos,
  };
}
