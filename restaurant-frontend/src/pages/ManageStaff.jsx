// 📁 pages/ManageStaff.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data);
    } catch (err) {
      setError('Error fetching staff: ' + err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Register staff
  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/staff/register', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Staff registered successfully');
      setForm({ name: '', email: '', password: '', role: 'receptionist' });
      fetchStaff();
    } catch (err) {
      setError('Error registering staff: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await axios.delete(`/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaff();
    } catch (err) {
      setError('Error deleting staff: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Manage Staff</h1>

      {/* Form */}
      <div className="bg-white shadow-md rounded p-4 mb-6 max-w-md">
        <h2 className="font-bold text-lg mb-2">➕ Register Staff</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded w-full mb-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full mb-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full mb-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="border p-2 rounded w-full mb-4"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="receptionist">Receptionist</option>
          <option value="chef">Chef</option>
          <option value="waiter">Waiter</option>
        </select>
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      {/* Staff List */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="font-bold text-lg mb-4">📋 Staff List</h2>
        {staffList.length === 0 ? (
          <p>No staff found.</p>
        ) : (
          <ul className="space-y-2">
            {staffList.map((staff) => (
              <li
                key={staff._id}
                className="border p-2 flex justify-between items-center rounded"
              >
                <div>
                  <p className="font-semibold">{staff.name}</p>
                  <p className="text-sm text-gray-500">{staff.email}</p>
                  <p className="text-sm text-blue-600">Role: {staff.role}</p>
                </div>
                <button
                  onClick={() => handleDelete(staff._id)}
                  className="text-red-600 hover:underline"
                >
                  ❌ Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
