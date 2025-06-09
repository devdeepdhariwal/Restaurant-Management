import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders?status=completed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('❌ Error fetching completed orders:', err);
      alert('Failed to fetch completed orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading completed orders...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Completed Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No completed orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const completedAt = order.completedAt ? new Date(order.completedAt).toLocaleString() : "N/A";

            return (
              <div key={order._id} className="border p-4 rounded-xl shadow bg-white">
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
                <div className="text-sm text-gray-500">
                  Completed at: {completedAt}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
