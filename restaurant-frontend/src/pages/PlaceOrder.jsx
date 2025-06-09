import React from 'react';

export default function PlaceOrder() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Place a New Order 📝</h2>
      {/* You can embed your existing <AddOrder /> component here if it's separate */}
      <p className="text-gray-600">Form to select menu items, quantity, notes, and place the order.</p>
    </div>
  );
}