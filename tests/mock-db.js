// In-memory stand-in for the artifact `db` capability, injected before the page script.
(() => {
  const store = new Map(); // path -> body
  const listeners = new Set();
  const seed = window.__SEED__ || {};
  for (const [path, body] of Object.entries(seed)) store.set(path, structuredClone(body));
  const snapDoc = (path) => ({
    id: path.split('/').pop(), exists: store.has(path),
    data: () => (store.has(path) ? structuredClone(store.get(path)) : undefined),
    metadata: { fromCache: false, hasPendingWrites: false },
  });
  const children = (col) => [...store.keys()].filter(p => p.startsWith(col + '/') && p.split('/').length === col.split('/').length + 1).sort();
  const emit = () => setTimeout(() => listeners.forEach(l => l()), 0);
  const docRef = (path) => ({
    id: path.split('/').pop(), path,
    get: async () => snapDoc(path),
    set: async (d) => { store.set(path, structuredClone(d)); emit(); },
    update: async (d) => { if (!store.has(path)) throw { code: 'invalid_argument', message: 'missing' }; store.set(path, { ...store.get(path), ...structuredClone(d) }); emit(); },
    delete: async () => { store.delete(path); emit(); },
    onSnapshot: (next) => { const l = () => next(snapDoc(path)); listeners.add(l); setTimeout(l, 0); return () => listeners.delete(l); },
    collection: (sub) => colRef(path + '/' + sub),
  });
  const colRef = (path) => ({
    path,
    doc: (id) => docRef(path + '/' + (id || Math.random().toString(36).slice(2, 12))),
    add: async (d) => { const r = docRef(path + '/' + Math.random().toString(36).slice(2, 12)); await r.set(d); return r; },
    onSnapshot: (next) => {
      const l = () => { const docs = children(path).map(snapDoc); next({ docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }); };
      listeners.add(l); setTimeout(l, 0); return () => listeners.delete(l);
    },
    get: async () => { const docs = children(path).map(snapDoc); return { docs, size: docs.length, empty: !docs.length }; },
  });
  const db = { doc: docRef, collection: colRef };
  window.__store = store;
  window.claude = { use: async (name) => (name === 'db' && !window.__NO_DB__ ? db : null) };
})();
