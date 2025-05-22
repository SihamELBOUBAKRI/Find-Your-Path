import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import VisitorDashboard from './pages/VisitorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<VisitorDashboard/>} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;