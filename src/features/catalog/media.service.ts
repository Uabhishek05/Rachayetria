import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

function extensionOf(filename: string) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : 'bin';
}

export async function uploadCatalogFile(file: File, folder: 'books' | 'reels' | 'thumbnails' | 'chapters') {
  const ext = extensionOf(file.name);
  const safeName = Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const storageRef = ref(storage, `${folder}/${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
