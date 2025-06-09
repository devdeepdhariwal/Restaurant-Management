// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import AddOrder from './components/AddOrder';
import ActiveOrders from './pages/ActiveOrders';
import CompletedOrders from './pages/CompletedOrders';
import UpdateOrder from './pages/UpdateOrder';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageStaff from './pages/ManageStaff';
import MenuManagement from './pages/MenuManagement';
import AdminAnalytics from './pages/AdminAnalytics';
import UpdateMenuItem from './pages/UpdateMenuItem';
import SearchMenu from './components/SearchMenu';

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) return <Navigate to="/login" />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Staff Dashboard and routes (Receptionist has full access) */}
        <Route
          path="/staff-dashboard"
          element={
            <PrivateRoute roles={['admin', 'chef', 'waiter', 'receptionist']}>
              <StaffDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<div className="p-4">Welcome 👋</div>} />
          <Route path="place-order" element={<AddOrder />} />
          <Route path="active-orders" element={<ActiveOrders />} />
          <Route path="completed-orders" element={<CompletedOrders />} />
          <Route path="update-order/:id" element={<UpdateOrder />} /> {/* ✅ Fix applied here */}
        </Route>

        {/* Admin-only Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<div className="p-4">Welcome Admin 👋</div>} />
          <Route path="staff" element={<ManageStaff />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Shared Access */}
        <Route
          path="/menu/update/:id"
          element={
            <PrivateRoute roles={['admin', 'chef', 'waiter', 'receptionist']}>
              <UpdateMenuItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu/search"
          element={
            <PrivateRoute roles={['admin', 'chef', 'waiter', 'receptionist']}>
              <SearchMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/update/:id"
          element={
            <PrivateRoute roles={['admin', 'chef', 'waiter', 'receptionist']}>
              <UpdateOrder />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
