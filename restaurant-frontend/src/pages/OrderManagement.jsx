import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Fetch orders on load
  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Orders</h2>

      {orders.map((order) => (
        <div key={order._id} className="border p-4 rounded shadow mb-4">
          <p className="font-semibold">Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>Customer Note: {order.note}</p>

          <ul className="mt-2 list-disc pl-5">
            {order.items.map((item, idx) => (
              <li key={idx}>
            Item ID: {item.menuItemId?._id || item.menuItemId} — 
            Name: {item.menuItemId?.name || "Unknown"} — 
            Category: {item.menuItemId?.category || "N/A"} — 
            ₹{item.menuItemId?.price || "N/A"} — 
            Quantity: {item.quantity} — 
            Note: {item.note || "None"}
               </li>

            ))}
          </ul>

          <button
            onClick={() => navigate(`/orders/edit/${order._id}`)}
            className="mt-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
};

export default OrderManagement;
