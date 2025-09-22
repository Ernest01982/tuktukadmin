import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Settings() {
  const [googleKey, setGoogleKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_app_setting', { p_key: 'maps.google' });
    if (!error && data) {
      setGoogleKey((data.apiKey as string) ?? '');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true); setMsg(null);
    const value = { apiKey: googleKey };
    const { error } = await supabase.rpc('set_app_setting', { p_key: 'maps.google', p_value: value });
    setBusy(false);
    setMsg(error ? error.message : 'Saved.');
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="bg-white border rounded p-4 space-y-3 max-w-xl">
        <div className="font-semibold">Map APIs</div>
        <label className="block text-sm">Google Maps API Key</label>
        <input className="w-full border rounded p-2" placeholder="AIza..." value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} />
        <button onClick={save} disabled={busy} className="rounded bg-black text-white py-2 px-4">{busy ? 'Saving…' : 'Save'}</button>
        {msg && <div className="text-sm">{msg}</div>}
        <div className="text-xs text-gray-500">Tip: for production, prefer Supabase Secrets in Edge Functions for third-party calls.</div>
      </div>
    </div>
  );
}