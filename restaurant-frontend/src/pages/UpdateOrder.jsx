import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [menu, setMenu] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [orderRes, menuRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/menu", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setOrder(orderRes.data);
        setMenu(menuRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("❌ Failed to load data");
          console.error(err);
        }
      }
    };

    fetchData();
  }, [id, token]);

  const handleStatusUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status: order.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setMessage("✅ Status updated");
    } catch (err) {
      setError("❌ Failed to update status");
    }
  };

  const updateItem = async (item, index) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/orders/${id}/update-item`,
        {
          menuItemId: item.menuItemId._id,
          quantity: item.quantity,
          customization: item.customization || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setMessage("✅ Item updated");
    } catch (err) {
      setError("❌ Failed to update item");
    }
  };

  const removeItem = async (menuItemId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/orders/${id}/remove-item`,
        { menuItemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setMessage("✅ Item removed");
    } catch (err) {
      setError("❌ Failed to remove item");
    }
  };

  const addItem = async () => {
    try {
      const item = menu.find((m) => m._id === newItem);
      if (!item) return;

      const res = await axios.put(
        `http://localhost:5000/api/orders/${id}/add-item`,
        {
          menuItemId: item._id,
          quantity: 1,
          customization: "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(res.data);
      setNewItem("");
      setMessage("✅ Item added");
    } catch (err) {
      setError("❌ Failed to add item");
    }
  };

  if (!order) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Edit Order</h2>

      {message && <div className="text-green-600 mb-2">{message}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Status */}
      <div className="mb-4">
        <label className="block mb-1">Status:</label>
        <select
          value={order.status}
          onChange={(e) => setOrder({ ...order, status: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          className="bg-blue-600 text-white px-3 py-1 mt-2 rounded"
          onClick={handleStatusUpdate}
        >
          Update Status
        </button>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold mb-2">Items:</h3>
        {order.items.map((item, idx) => (
          <div key={idx} className="mb-2 p-2 border rounded">
            <div className="font-medium">{item.menuItemId?.name || "Deleted item"}</div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const newItems = [...order.items];
                newItems[idx].quantity = parseInt(e.target.value);
                setOrder({ ...order, items: newItems });
              }}
              className="border p-1 mr-2 w-16"
            />
            <input
              type="text"
              placeholder="Customization"
              value={item.customization || ""}
              onChange={(e) => {
                const newItems = [...order.items];
                newItems[idx].customization = e.target.value;
                setOrder({ ...order, items: newItems });
              }}
              className="border p-1 mr-2"
            />
            <button
              className="bg-green-500 text-white px-2 py-1 rounded mr-2"
              onClick={() => updateItem(item, idx)}
            >
              Update
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => removeItem(item.menuItemId._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="mt-6">
        <label className="block mb-1">Add Item:</label>
        <select
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option value="">-- Select Menu Item --</option>
          {menu.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </div>
    </div>
  );
}
