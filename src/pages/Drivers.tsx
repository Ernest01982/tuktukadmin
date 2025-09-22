import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Row = { id: string; full_name: string | null; phone: string | null; email: string | null; bg_check: string; is_active: boolean };

export default function Drivers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,full_name,phone,email,bg_check,is_active')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setRows(data as Row[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Drivers</h1>
      {err && <div className="text-red-600">{err}</div>}
      <div className="bg-white border rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr><Th>ID</Th><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>BG Check</Th><Th>Active</Th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <Td mono>{r.id}</Td><Td>{r.full_name ?? '-'}</Td><Td>{r.phone ?? '-'}</Td>
                <Td>{r.email ?? '-'}</Td><Td>{r.bg_check}</Td><Td>{r.is_active ? 'Yes' : 'No'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => <td className={`p-2 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>;