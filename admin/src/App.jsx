import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddSite from './pages/AddSite';
import Profile from './pages/Profile';
import AllSites from './pages/AllSites';
import AddClientDemo from './pages/AddClientDemo';
import AllClientSites from './pages/AllClientSites';
import Guide from './pages/Guide';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import WebsiteCms from './pages/WebsiteCms';
import ScriptSites from './pages/ScriptSites';
import DemoRequests from './pages/DemoRequests';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Guard wrapper to restrict routes exclusively to superadmin role
const SuperadminOnlyRoute = ({ children }) => {
  const role = localStorage.getItem('adminRole');
  if (role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Panel Views under persistent Sidebar Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Index route: list demo sites */}
          <Route index element={<Dashboard />} />
          
          {/* Add Site Route */}
          <Route path="add" element={<AddSite />} />
          
          {/* Edit Site Route */}
          <Route path="edit/:id" element={<AddSite />} />

          {/* Client Sites Routes */}
          <Route path="add-client-demo" element={<AddClientDemo />} />
          <Route path="edit-client-demo/:id" element={<AddClientDemo />} />
          <Route path="all-client-sites" element={<AllClientSites />} />
          
          {/* Profile Route */}
          <Route path="profile" element={<Profile />} />

          {/* All Sites Route */}
          <Route path="all-sites" element={<AllSites />} />

          {/* Website CMS Route */}
          <Route path="website-cms" element={<WebsiteCms />} />

          {/* Script Sites Route */}
          <Route path="script-sites" element={<ScriptSites />} />

          {/* Consolidated Settings Route */}
          <Route path="settings" element={<Settings />} />

          {/* Guide Route */}
          <Route path="guide" element={<Guide />} />

          {/* Notifications Route */}
          <Route path="notifications" element={<Notifications />} />

          {/* Demo Requests Route */}
          <Route path="demo-requests" element={<DemoRequests />} />
          
          {/* Layout Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* General Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
