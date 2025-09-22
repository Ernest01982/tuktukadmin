import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type Ride = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: string;
  requested_at: string;
  updated_at: string;
};

export default function Rides() {
  const [rows, setRows] = useState<Ride[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('rides')
      .select('id,rider_id,driver_id,status,requested_at,updated_at')
      .order('requested_at', { ascending: false })
      .limit(50);
    if (error) setErr(error.message);
    else setRows(data as Ride[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel('rides-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, (_payload) => {
        // refresh light: re-fetch list
        load();
      })
      .subscribe();
    channelRef.current = ch;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Rides (latest 50)</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="bg-white border rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>ID</Th><Th>Rider</Th><Th>Driver</Th><Th>Status</Th><Th>Requested</Th><Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <Td mono>{r.id}</Td>
                <Td mono>{r.rider_id}</Td>
                <Td mono>{r.driver_id ?? '-'}</Td>
                <Td>{r.status}</Td>
                <Td>{new Date(r.requested_at).toLocaleString()}</Td>
                <Td>{new Date(r.updated_at).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => (
  <td className={`p-2 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>
);