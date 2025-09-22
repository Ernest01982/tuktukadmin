import React, { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, session, isAdmin } = useContext(AuthContext);
  if (loading) return <div className="p-8">Loading…</div>;
  if (!session) return <div className="p-8">Please sign in as an admin.</div>;
  if (!isAdmin) return <div className="p-8">Access denied. Admins only.</div>;
  return <>{children}</>;
};