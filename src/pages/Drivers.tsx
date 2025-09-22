import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, X } from 'lucide-react';

type Row = { id: string; full_name: string | null; phone: string | null; email: string | null; bg_check: string; is_active: boolean };

type NewDriverForm = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
};
export default function Drivers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewDriverForm>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    make: '',
    model: '',
    year: '',
    color: '',
    plate: ''
  });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
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

  const handleInputChange = (field: keyof NewDriverForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      make: '',
      model: '',
      year: '',
      color: '',
      plate: ''
    });
    setCreateErr(null);
  };

  const createDriver = async () => {
    setCreating(true);
    setCreateErr(null);

    try {
      // Call Edge Function to create driver
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-driver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create driver');
      }

      // Success - reload data and close form
      await load();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      setCreateErr(error.message || 'Failed to create driver');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Driver
        </button>
      </div>

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

      {/* Create Driver Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Driver</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Vehicle Information</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full border rounded p-2"
                      min="1900"
                      max="2030"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">License Plate</label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => handleInputChange('plate', e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              {createErr && (
                <div className="text-red-600 text-sm">{createErr}</div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createDriver}
                  disabled={creating || !formData.email || !formData.password}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Driver'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<{ children: React.ReactNode; mono?: boolean }> = ({ children, mono }) => <td className={`p-2 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>;