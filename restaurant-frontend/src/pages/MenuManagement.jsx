import React from "react";
import AddMenuItem from "../components/AddMenuItem";
import SearchMenu from "../components/SearchMenu";

const MenuManagement = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Menu Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Add Menu */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
          <AddMenuItem />
        </div>

        {/* Right Column: Search Menu */}
        <div className="bg-white p-6 rounded shadow">
          <SearchMenu />
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
