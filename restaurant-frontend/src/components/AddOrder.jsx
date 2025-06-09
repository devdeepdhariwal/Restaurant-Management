import React, { useEffect, useState } from "react";

const AddOrder = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderData, setOrderData] = useState({
    customerName: "",
    items: [{ menuItemId: "", quantity: 1, customization: "" }],
    notes: "",
  });

  // Fetch menu items from the backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/menu");
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  const handleChange = (e, index, field) => {
    const newItems = [...orderData.items];
    newItems[index][field] = e.target.value;
    setOrderData({ ...orderData, items: newItems });
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { menuItemId: "", quantity: 1, customization: "" }],
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token"); // 🔐 get token
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔐 add auth header
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Order placed!");
      console.log(data);
      // Optional: reset form
      setOrderData({
        customerName: "",
        items: [{ menuItemId: "", quantity: 1, customization: "" }],
        notes: "",
      });
    } else {
      console.error("❌ Server error:", data.error);
      alert(`Failed: ${data.error}`);
    }
  } catch (err) {
    console.error("❌ Error placing order:", err);
    alert("An unexpected error occurred while placing the order.");
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto mt-10"
    >
      <h2 className="text-2xl font-bold mb-4">Place New Order</h2>

      <div className="mb-4">
        <label className="block font-medium">Customer Name</label>
        <input
          className="w-full p-2 border rounded"
          value={orderData.customerName}
          onChange={(e) =>
            setOrderData({ ...orderData, customerName: e.target.value })
          }
        />
      </div>

      {orderData.items.map((item, index) => (
        <div key={index} className="mb-4 border p-3 rounded">
          <label className="block font-medium">Select Menu Item</label>
          <select
            className="w-full p-2 border rounded"
            value={item.menuItemId}
            onChange={(e) => handleChange(e, index, "menuItemId")}
          >
            <option value="">-- Select an Item --</option>
            {menuItems.map((menu) => (
              <option key={menu._id} value={menu._id}>
                {menu.name}
              </option>
            ))}
          </select>

          <label className="block font-medium mt-2">Quantity</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={item.quantity}
            onChange={(e) => handleChange(e, index, "quantity")}
          />

          <label className="block font-medium mt-2">Customization</label>
          <input
            className="w-full p-2 border rounded"
            value={item.customization}
            onChange={(e) => handleChange(e, index, "customization")}
            placeholder="e.g., Extra cheese"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="mb-4 bg-green-600 text-white py-1 px-3 rounded"
      >
        + Add Item
      </button>

      <div className="mb-4">
        <label className="block font-medium">Additional Notes</label>
        <textarea
          className="w-full p-2 border rounded"
          value={orderData.notes}
          onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Submit Order
      </button>
    </form>
  );
};

export default AddOrder;
