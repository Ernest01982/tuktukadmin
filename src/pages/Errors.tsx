import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// helper any component can import to log client-side errors
export async function logClientError(
  context: string,
  location: string,
  message: string,
  details?: unknown
) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('error_logs').insert({
    user_id: user?.id ?? null,
    context,
    location,
    message,
    details: details ?? null, // <-- pass the object directly
  });
}

type Row = { id: number; user_id: string | null; context: string | null; location: string | null; message: string; details: unknown | null; created_at: string };

export default function Errors() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const load = useCallback(async () => {
    setErr(null);
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) setErr(error.message);
    else setRows(data as Row[]);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Errors</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="bg-white border rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><Th>ID</Th><Th>When</Th><Th>User</Th><Th>Context</Th><Th>Location</Th><Th>Message</Th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t align-top">
                <Td mono>{r.id}</Td>
                <Td>{new Date(r.created_at).toLocaleString()}</Td>
                <Td mono>{r.user_id ?? '-'}</Td>
                <Td>{r.context ?? '-'}</Td>
                <Td>{r.location ?? '-'}</Td>
                <Td>{r.message}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="border rounded px-3 py-1" disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))}>Prev</button>
        <button className="border rounded px-3 py-1" onClick={() => setPage(p => p+1)}>Next</button>
      </div>
    </div>
  );
}
const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => <td className={`p-2 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>;