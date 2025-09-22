import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthProvider';
import { RequireAdmin } from './auth/RequireAdmin';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rides from './pages/Rides';
import Drivers from './pages/Drivers';
import Riders from './pages/Riders';
import Settings from './pages/Settings';
import Errors from './pages/Errors';

export default function App() {
  const { session, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8">Loading…</div>;

  if (!session) return <Login />;

  return (
    <RequireAdmin>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/errors" element={<Errors />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </RequireAdmin>
  );
}
