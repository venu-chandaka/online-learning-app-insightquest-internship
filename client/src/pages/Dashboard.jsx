import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Dashboard(){
  const { logout } = useAuth();
  return (
    <div className="max-w-4xl mx-auto py-20">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-3 text-gray-600">This is a protected page. You got here because you are authenticated.</p>
        <div className="mt-6">
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">Sign out</button>
        </div>
      </div>
    </div>
  )
}
