
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
import SavedItemsPage from './components/SavedItemsPage';
import ForgotPassword from './components/reset_password/ForgotPassword';
import ResetPassword from './components/reset_password/ResetPassword';
import HomePage from './components/HomePage';
import ConnectionsPage from './components/ConnectionsPage';
import PostDetailPage from './components/posts/PostDetailPage';
import CoreTypePage from './components/core-type/CoreTypePage';
import MessagesPage from './components/messages/MessagesPage';
import BlockedUsersPage from './components/messages/BlockedUsersPage';
import PostsPage from './components/posts/PostsPage';
import ContactRequestsPage from './components/messages/ContactRequestsPage';
import PersonalityTest from './components/core-type/PersonalityTest';
import PersonalityDetail from './components/core-type/PersonalityDetail';
import AdminUsers from './AdminComponents/AdminUsers';
import AdminInstitutions from './AdminComponents/AdminInstitutions';
import InstitutionDetailPage from './AdminComponents/InstitutionDetailPage';
import AdminEvents from './AdminComponents/AdminEvents';
import AdminPersonalityTypes from './AdminComponents/AdminPersonalityTypes';
import EventDetailPage from './AdminComponents/EventDetailPage';

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
            <Route path="posts/:postId" element={<PostDetailPage />} />
            <Route path="institutions" element={<InstitutionsPage />} />
            <Route path="institutions/:id" element={<InstitutionDetailPage />} />

            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="messages/:userId" element={<MessagesPage/>} />
            <Route path="core-type" element={<CoreTypePage />} />
            <Route path="core-type/personality-test" element={<PersonalityTest />} />
            <Route path="core-type/personality-types/:slug" element={<PersonalityDetail />} />
            <Route path="saved-items" element={<SavedItemsPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="" element={<HomePage />} />
            <Route path="blocked-users" element={<BlockedUsersPage />} />
            <Route path="contact-requests" element={<ContactRequestsPage />} />
        </Route>

        <Route path="/admin-dashboard" element={<AdminDashboard />} >
            <Route path="users" element={<AdminUsers />} />
            <Route path="institutions" element={<AdminInstitutions/>} />
            <Route path="institutions/:id" element={<InstitutionDetailPage />} />
            <Route path="events" element={<AdminEvents/>} />
            <Route path="messages" element={<MessagesPage/>} />
            <Route path="core-type" element={<AdminPersonalityTypes />} />


        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;