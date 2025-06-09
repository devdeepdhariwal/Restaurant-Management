import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActiveOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders/active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('❌ Error fetching active orders:', err);
      alert('Failed to fetch active orders.');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: 'completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchActiveOrders(); // Refresh the list
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert('Failed to update order status.');
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading active orders...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">In Progress Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No active orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded-xl shadow-md bg-white">
              <h3 className="text-lg font-bold mb-2">Order #{order._id.slice(-5)}</h3>
              <ul className="mb-2">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      🍽 {item.menuItemId?.name} x {item.quantity}
                    </span>
                    {item.customization && (
                      <span className="text-sm text-gray-500 italic">
                        {item.customization}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {order.notes && (
                <p className="text-sm text-blue-600 mb-2">📝 Notes: {order.notes}</p>
              )}
              <div className="text-sm text-gray-500 mb-2">
                Placed at: {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => markAsCompleted(order._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  ✅ Mark as Completed
                </button>

                <button
                  onClick={() => navigate(`/staff-dashboard/update-order/${order._id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  ✏️ Edit Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
