import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import all your pages and components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Directory from './pages/Directory';
import Events from './pages/Events';
import News from './pages/News';
import Forums from './pages/Forums';
import Gallery from './pages/Gallery';
import Donations from './pages/Donations';
import DonationSuccess from './pages/DonationSuccess';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<News />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/donations/success" element={<DonationSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;