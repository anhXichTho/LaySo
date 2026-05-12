import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { QueueItem, ThemeConfig, DEFAULT_THEME, generateId } from "./utils";

const QUEUE_COLLECTION = "photo_queue";
const CONFIG_DOC = "app_config";
const CONFIG_COLLECTION = "settings";

export async function addToQueue(name: string, phone: string): Promise<QueueItem> {
  const snapshot = await getDocs(collection(db, QUEUE_COLLECTION));
  const order = snapshot.size + 1;

  const item: Omit<QueueItem, "id"> = {
    name,
    phone,
    registeredAt: Date.now(),
    status: "waiting",
    order,
  };

  const docRef = await addDoc(collection(db, QUEUE_COLLECTION), item);
  return { ...item, id: docRef.id };
}

export async function updateQueueItemStatus(id: string, status: QueueItem["status"]) {
  await updateDoc(doc(db, QUEUE_COLLECTION, id), { status });
}

export function subscribeToQueue(callback: (items: QueueItem[]) => void) {
  const q = query(collection(db, QUEUE_COLLECTION), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const items: QueueItem[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<QueueItem, "id">),
    }));
    callback(items);
  });
}

export async function getThemeConfig(): Promise<ThemeConfig> {
  const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { ...DEFAULT_THEME, ...snap.data() } as ThemeConfig;
  }
  return DEFAULT_THEME;
}

export async function saveThemeConfig(theme: ThemeConfig) {
  const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
  await setDoc(docRef, theme, { merge: true });
}

export function subscribeToTheme(callback: (theme: ThemeConfig) => void) {
  const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ ...DEFAULT_THEME, ...snap.data() } as ThemeConfig);
    } else {
      callback(DEFAULT_THEME);
    }
  });
}

export async function saveStartTime(time: number) {
  const docRef = doc(db, CONFIG_COLLECTION, "session");
  await setDoc(docRef, { startTime: time }, { merge: true });
}

export async function getStartTime(): Promise<number | null> {
  const docRef = doc(db, CONFIG_COLLECTION, "session");
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().startTime) {
    return snap.data().startTime;
  }
  return null;
}

export async function clearAllQueue() {
  const snapshot = await getDocs(collection(db, QUEUE_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  const sessionRef = doc(db, CONFIG_COLLECTION, "session");
  await setDoc(sessionRef, { startTime: null });
}

export function subscribeToSession(callback: (data: { startTime: number | null }) => void) {
  const docRef = doc(db, CONFIG_COLLECTION, "session");
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ startTime: snap.data().startTime || null });
    } else {
      callback({ startTime: null });
    }
  });
}
