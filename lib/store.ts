import { db } from "./firebase";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc,
  getDocs,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { QueueItem, ThemeConfig, DEFAULT_THEME } from "./utils";

const QUEUE_COLLECTION = "photo_queue";
const CONFIG_DOC = "app_config";
const CONFIG_COLLECTION = "settings";
const COUNTER_DOC = "queue_counter";

export async function addToQueue(name: string, phone: string, email: string): Promise<QueueItem> {
  const normalizedEmail = email.trim().toLowerCase();
  const emailDocRef = doc(db, QUEUE_COLLECTION, normalizedEmail);
  const counterRef = doc(db, CONFIG_COLLECTION, COUNTER_DOC);

  return runTransaction(db, async (transaction) => {
    const emailSnap = await transaction.get(emailDocRef);
    if (emailSnap.exists()) {
      throw new Error("Email này đã được đăng ký!");
    }

    const counterSnap = await transaction.get(counterRef);
    const currentOrder = counterSnap.exists() ? counterSnap.data().currentOrder : 0;
    const newOrder = currentOrder + 1;

    const item: Omit<QueueItem, "id"> = {
      name,
      phone,
      email: normalizedEmail,
      registeredAt: Date.now(),
      status: "waiting",
      order: newOrder,
    };

    transaction.set(counterRef, { currentOrder: newOrder });
    transaction.set(emailDocRef, item);

    return { ...item, id: normalizedEmail };
  });
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
  await setDoc(docRef, { startTime: time, turnStartTime: time }, { merge: true });
}

export async function saveTurnStartTime(time: number) {
  const docRef = doc(db, CONFIG_COLLECTION, "session");
  await setDoc(docRef, { turnStartTime: time }, { merge: true });
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
  batch.delete(doc(db, CONFIG_COLLECTION, COUNTER_DOC));
  await batch.commit();
  const sessionRef = doc(db, CONFIG_COLLECTION, "session");
  await setDoc(sessionRef, { startTime: null, turnStartTime: null });
}

export function subscribeToSession(callback: (data: { startTime: number | null; turnStartTime: number | null }) => void) {
  const docRef = doc(db, CONFIG_COLLECTION, "session");
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      callback({ startTime: d.startTime || null, turnStartTime: d.turnStartTime || null });
    } else {
      callback({ startTime: null, turnStartTime: null });
    }
  });
}
