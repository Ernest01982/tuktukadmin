import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Metrics = {
  ts: string;
  rides_last_24h: number;
  active_drivers: number;
  rides_by_status: Record<string, number>;
  errors_last_24h: number;
};

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const { data, error } = await supabase.rpc('admin_dashboard_metrics');
    if (error) setErr(error.message);
    else setData(data as Metrics);
  }, []);

  useEffect(() => { load(); }, [load]); // zero-loop: stable ref

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {err && <div className="text-red-600">{err}</div>}
      {!data ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="Rides (24h)" value={data.rides_last_24h} />
          <Stat label="Active drivers" value={data.active_drivers} />
          <Stat label="Errors (24h)" value={data.errors_last_24h} />
          <Stat label="Statuses" value={Object.keys(data.rides_by_status || {}).length} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}