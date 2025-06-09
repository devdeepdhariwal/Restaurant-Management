import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/menu/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching item:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to update a menu item.");
      return;
    }

    const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      alert("Menu item updated!");
      navigate("/admin-dashboard/menu"); // or navigate("/admin-dashboard/menu");
    } else {
      const error = await response.json();
      alert("Failed to update item: " + (error.message || "Unknown error"));
    }
  };

  if (loading) return <div className="p-6">Loading item...</div>;
  if (!item) return <div className="p-6 text-red-600">Item not found</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Update Menu Item</h2>
      <input
        type="text"
        name="name"
        value={item.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        name="category"
        value={item.category}
        onChange={handleChange}
        placeholder="Category"
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="price"
        value={item.price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        name="tags"
        value={item.tags?.join(", ")}
        onChange={(e) =>
          setItem({
            ...item,
            tags: e.target.value.split(",").map((tag) => tag.trim()),
          })
        }
        placeholder="Tags (comma separated)"
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        name="ingredients"
        value={item.ingredients?.join(", ")}
        onChange={(e) =>
          setItem({
            ...item,
            ingredients: e.target.value.split(",").map((i) => i.trim()),
          })
        }
        placeholder="Ingredients (comma separated)"
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleUpdate}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Update
      </button>
    </div>
  );
};

export default UpdateMenuItem;
