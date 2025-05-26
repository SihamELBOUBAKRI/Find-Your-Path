
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import VisitorDashboard from './pages/VisitorDashboard';
import MentorDashboard from './pages/mentor_dashboard/MentorDashboard';
import StudentDashboard from './pages/student_dashboard/StudentDashboard';
import AdminDashboard from './pages/Admin_dashboard/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import InstitutionsPage from './components/InstitutionsPage';
import EventsPage from './components/EventsPage';
import MessagesPage from './components/MessagesPage';
import CoreTypePage from './components/CoreTypePage';
import SavedItemsPage from './components/SavedItemsPage';
import ForgotPassword from './components/reset_password/ForgotPassword';
import ResetPassword from './components/reset_password/ResetPassword';
import HomePage from './components/HomePage';
import BlockedUsersPage from './components/BlockedUsersPage';
import ContactRequestsPage from './components/ContactRequestsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<VisitorDashboard />} />
        <Route path="/login" element={<VisitorDashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard/>} />

        <Route path="/student-dashboard" element={<StudentDashboard />} >
          <Route path="profile" element={<ProfilePage />} />
          <Route path="institutions" element={<InstitutionsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:userId" element={<MessagesPage />} />
          <Route path="core-type" element={<CoreTypePage />} />
          <Route path="saved-items" element={<SavedItemsPage />} />
          <Route path="" element={<HomePage />} />
          <Route path="blocked-users" element={<BlockedUsersPage />} />
          <Route path="contact-requests" element={<ContactRequestsPage />} />


        </Route>

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;