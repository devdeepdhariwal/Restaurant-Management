import React, { useState } from "react";

const AddMenuItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    ingredients: "",
    tags: "",
    availability: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      ingredients: formData.ingredients.split(",").map((i) => i.trim()),
      tags: formData.tags.split(",").map((t) => t.trim()),
    };

    const token = localStorage.getItem("token"); // ✅ Required for authorization

    try {
      const res = await fetch("http://localhost:5000/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      alert("✅ Menu item added!");

      setFormData({
        name: "",
        category: "",
        price: "",
        ingredients: "",
        tags: "",
        availability: true,
      });

      window.location.reload(); // ✅ Better than assigning URL manually
      console.log(data);
    } catch (err) {
      console.error("❌ Error adding menu item:", err);
      alert("Something went wrong. See console.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mt-10"
    >
      <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>

      <div className="mb-4">
        <label className="block font-medium">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., Margherita Pizza"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Category</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., Pizza"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Price (₹)</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">
          Ingredients (comma separated)
        </label>
        <input
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., Cheese, Tomato"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Tags (comma separated)</label>
        <input
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., spicy, vegan"
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          name="availability"
          type="checkbox"
          checked={formData.availability}
          onChange={handleChange}
          className="mr-2"
        />
        <label>Available</label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default AddMenuItem;
