// 📄 pages/StaffDashboard.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Staff Dashboard</h2>

          <nav className="flex flex-col space-y-2">
            <NavLink
              to="place-order"
              className={({ isActive }) =>
                `px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              📥 Place Order
            </NavLink>

            <NavLink
              to="active-orders"
              className={({ isActive }) =>
                `px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              🔄 Active Orders
            </NavLink>

            <NavLink
              to="completed-orders"
              className={({ isActive }) =>
                `px-4 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              ✅ Completed Orders
            </NavLink>
          </nav>
        </div>

        {/* Logout button at the bottom */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
