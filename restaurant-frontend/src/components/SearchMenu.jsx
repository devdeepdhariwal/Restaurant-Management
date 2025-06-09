import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchMenu = () => {
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "price",
    order: "asc",
  });

  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const navigate = useNavigate();

  // ✅ Load categories on first load
  useEffect(() => {
    fetch("http://localhost:5000/api/menu/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // ✅ Fetch ingredients when category changes
  useEffect(() => {
    if (!filters.category) {
      setIngredientsList([]);
      setSelectedIngredients([]);
      return;
    }

    fetch(`http://localhost:5000/api/menu/ingredients?category=${filters.category}`)
      .then((res) => res.json())
      .then(setIngredientsList)
      .catch((err) => console.error("Error loading ingredients:", err));
  }, [filters.category]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    const queryParams = new URLSearchParams({
      ...filters,
      ingredients: selectedIngredients.join(","),
    }).toString();

    const res = await fetch(`http://localhost:5000/api/menu/search?${queryParams}`);
    const data = await res.json();
    setResults(data.items);
  };

  const handleClear = () => {
    setFilters({
      name: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "price",
      order: "asc",
    });
    setSelectedIngredients([]);
    setIngredientsList([]);
    setResults([]);
  };

  const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this menu item?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/menu/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("Item deleted");
      setResults((prev) => prev.filter((item) => item._id !== id));
    } else {
      alert("Failed to delete item");
    }
  } catch (err) {
    console.error("Error deleting item:", err);
    alert("An error occurred while deleting.");
  }
};




  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Search Menu</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Search by name"
          value={filters.name}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      {/* Ingredients Multi-Select */}
      {filters.category && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Filter by Ingredients:</label>
          <select
            multiple
            value={selectedIngredients}
            onChange={(e) =>
              setSelectedIngredients(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
            className="w-full p-2 border rounded h-32"
          >
            {ingredientsList.map((ing, idx) => (
              <option key={idx} value={ing}>
                {ing}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort + Search */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="price">Sort by Price</option>
          <option value="name">Sort by Name</option>
        </select>

        <select
          name="order"
          value={filters.order}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>

        <button
          onClick={handleClear}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((item) => (
    <div key={item._id} className="border p-4 rounded shadow">
    <h3 className="text-lg font-bold">{item.name}</h3>
    <p className="text-sm text-gray-700">Category: {item.category}</p>
    <p className="text-sm">Price: ₹{item.price}</p>
    <p className="text-sm">Tags: {item.tags?.join(", ")}</p>
    <p className="text-sm">Ingredients: {item.ingredients?.join(", ")}</p>

    <button
      onClick={() => navigate(`/menu/update/${item._id}`)}
      className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
    >
      Edit
    </button>

   <button
    onClick={() => handleDelete(item._id)}
    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
  >
    Delete
  </button>


  </div>
))}
      </div>
    </div>
  );
};

export default SearchMenu;
