const DB_NAME = 'vadeo-dev-media';
const STORE_NAME = 'media';
const DB_VERSION = 1;
const LOCAL_MEDIA_SCHEME = 'local-media://';

type MediaRecord = {
  id: string;
  blob: Blob;
  createdAt: number;
};

const canUseIndexedDb = () => typeof window !== 'undefined' && 'indexedDB' in window;

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open media database.'));
  });
};

const readBlobFromUrl = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch local media blob: ${response.status}`);
  }
  return response.blob();
};

export const localMediaStore = {
  isLocalMediaUri(src: string) {
    return src.startsWith(LOCAL_MEDIA_SCHEME);
  },

  async persistBlobUrl(src: string): Promise<string> {
    if (!src.startsWith('blob:')) {
      return src;
    }

    const blob = await readBlobFromUrl(src);
    const id = crypto.randomUUID();
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, blob, createdAt: Date.now() } satisfies MediaRecord);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to persist local media.'));
      tx.onabort = () => reject(tx.error ?? new Error('Persist local media transaction aborted.'));
    });

    return `${LOCAL_MEDIA_SCHEME}${id}`;
  },

  async resolveSrc(src: string): Promise<string> {
    if (!this.isLocalMediaUri(src)) {
      return src;
    }

    const id = src.replace(LOCAL_MEDIA_SCHEME, '');
    const db = await openDb();

    const record = await new Promise<MediaRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as MediaRecord | undefined);
      request.onerror = () => reject(request.error ?? new Error('Failed to load local media.'));
    });

    if (!record?.blob) {
      throw new Error('Stored local media could not be found.');
    }

    return URL.createObjectURL(record.blob);
  }
};
