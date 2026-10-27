import type { Database } from './types';
import { createSeed } from './seed';
const KEY = 'bengkel-alwi-demo-v1';
let queue: Promise<unknown> = Promise.resolve();
export const repository = {
  async load(): Promise<Database> {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createSeed();
    try { const data = JSON.parse(raw); if (data.version !== 1 || !['accounts', 'vehicles', 'workshops', 'products', 'questions', 'bookings', 'orders'].every(k => Array.isArray(data[k])) || !data.carts || !data.accounts.some((a: {id: string}) => a.id === data.activeAccountId)) throw new Error(); return data; }
    catch { throw new Error('Data demo tidak dapat dibaca. Gunakan Reset demo untuk memulai kembali.'); }
  },
  async transact(change: (db: Database) => void): Promise<Database> {
    const task = queue.then(async () => { const db = structuredClone(await repository.load()); change(db); try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { throw new Error('Penyimpanan browser tidak tersedia atau penuh. Perubahan belum tersimpan.'); } return db; }); queue = task.catch(() => {}); return task;
  },
  async reset() { const db = createSeed(); localStorage.setItem(KEY, JSON.stringify(db)); return db; },
  key: KEY,
};
