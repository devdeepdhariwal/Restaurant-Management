import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

export default function StaffOrders() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !['chef', 'waiter', 'receptionist'].includes(role)) {
      navigate('/login');
    }
  }, [navigate]);

  const currentTab = location.pathname.split('/').pop();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
      
      <div className="flex gap-4 mb-6">
        <Link
          to="place"
          className={`px-4 py-2 rounded ${
            currentTab === 'place' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Place Order
        </Link>
        <Link
          to="active"
          className={`px-4 py-2 rounded ${
            currentTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Active Orders
        </Link>
        <Link
          to="completed"
          className={`px-4 py-2 rounded ${
            currentTab === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Completed Orders
        </Link>
      </div>

      {/* Render nested routes here */}
      <Outlet />
    </div>
  );
}
