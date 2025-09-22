import React, { useContext, useState } from 'react';
import { AuthContext } from '../auth/AuthProvider';

export default function Login() {
  const { signInWithEmail } = useContext(AuthContext);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmail(email, password);
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message ?? 'Sign-in failed');
      else setErr('Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="bg-white border rounded p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Admin Sign in</h1>
        <input className="w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={busy} className="w-full rounded bg-black text-white py-2">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}