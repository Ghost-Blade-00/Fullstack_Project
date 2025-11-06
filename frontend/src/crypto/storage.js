import { set, get } from "idb-keyval";

const KEYS = {
  identity: "id.identity",
  sessions: "ratchet.sessions",
  prekeys: "prekeys.published",
};

export async function saveIdentity(val){ await set(KEYS.identity, val); }
export async function loadIdentity(){ return get(KEYS.identity); }

export async function saveSession(peerDeviceId, session){
  const all = (await get(KEYS.sessions)) || {};
  all[peerDeviceId] = session;
  await set(KEYS.sessions, all);
}
export async function loadSession(peerDeviceId){
  const all = (await get(KEYS.sessions)) || {};
  return all[peerDeviceId] || null;
}

export async function savePrekeys(bundle){ await set(KEYS.prekeys, bundle); }
export async function loadPrekeys(){ return get(KEYS.prekeys); }
