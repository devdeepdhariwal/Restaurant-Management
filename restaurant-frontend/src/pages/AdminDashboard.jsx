import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') navigate('/login');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl p-4">
        <h2 className="text-xl font-bold mb-6">🛠️ Admin Panel</h2>
        <ul className="space-y-4">
          <li>
            <Link to="staff" className="block text-left w-full text-blue-600 hover:underline">
              👥 Manage Staff
            </Link>
          </li>
          <li>
            <Link to="menu" className="block text-left w-full text-blue-600 hover:underline">
              🍽️ Edit Menu
            </Link>
          </li>
          <li>
            <Link to="analytics" className="block text-left w-full text-blue-600 hover:underline">
              📊 View Analytics
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-left w-full text-red-600 hover:underline"
            >
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
