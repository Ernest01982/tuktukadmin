import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';

const link = 'block px-3 py-2 rounded hover:bg-gray-100';
const active = 'bg-gray-200';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useContext(AuthContext);

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white">
        <div className="p-4 text-xl font-semibold">Admin</div>
        <nav className="p-2 space-y-1">
          <NavLink to="/" end className={({isActive}) => `${link} ${isActive ? active : ''}`}>Dashboard</NavLink>
          <NavLink to="/rides" className={({isActive}) => `${link} ${isActive ? active : ''}`}>Rides</NavLink>
          <NavLink to="/drivers" className={({isActive}) => `${link} ${isActive ? active : ''}`}>Drivers</NavLink>
          <NavLink to="/riders" className={({isActive}) => `${link} ${isActive ? active : ''}`}>Riders</NavLink>
          <NavLink to="/settings" className={({isActive}) => `${link} ${isActive ? active : ''}`}>Settings</NavLink>
          <NavLink to="/errors" className={({isActive}) => `${link} ${isActive ? active : ''}`}>Errors</NavLink>
        </nav>
        <div className="p-2">
          <button onClick={signOut} className="w-full mt-4 rounded bg-black text-white py-2">Sign out</button>
        </div>
      </aside>
      <main className="bg-gray-50">{children}</main>
    </div>
  );
};