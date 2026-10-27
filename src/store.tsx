import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { repository } from './repository';
import type { Account, Database } from './types';
interface Store { db: Database; account: Account; busy: boolean; run: (change: (db: Database) => void, message?: string) => Promise<boolean>; notify: (message: string) => void; reset: () => Promise<void> }
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null); const [error, setError] = useState(''); const [toast, setToast] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { repository.load().then(setDb).catch(e => setError(e.message)); const onStorage = (e: StorageEvent) => { if (e.key === repository.key) repository.load().then(setDb).catch(e => setToast(e.message)); }; window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage); }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5500); return () => clearTimeout(timer); }, [toast]);
  async function reset() { try { setDb(await repository.reset()); setError(''); setToast('Data demo dikembalikan ke kondisi awal.'); } catch { setError('Browser tidak mengizinkan penyimpanan lokal. Aktifkan penyimpanan situs lalu muat ulang.'); } }
  async function run(change: (db: Database) => void, message?: string) { setBusy(true); try { setDb(await repository.transact(change)); if (message) setToast(message); return true; } catch (e) { setToast(e instanceof Error ? e.message : 'Perubahan belum dapat disimpan.'); return false; } finally { setBusy(false); } }
  if (!db) return <div className="boot"><div className="logo-mark">A<span /></div><h2>Bengkel Alwi</h2><p>{error || 'Menyiapkan perjalananmu…'}</p>{error && <button className="btn primary" onClick={reset}>Reset demo</button>}</div>;
  const account = db.accounts.find(a => a.id === db.activeAccountId)!;
  return <Context.Provider value={{ db, account, busy, run, notify: setToast, reset }}>{children}{toast && <div role="status" className="toast" onClick={() => setToast('')}>{toast}</div>}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('Store is unavailable'); return value; }
