import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import AuctionItem from './components/AuctionItem';
import PostAuction from './components/PostAuction';
import Landing from './components/Landing';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  
  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Validate token expiration
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            setUsername(tokenData.username || '');
          } else {
            // Token expired
            handleLogout();
          }
        } catch (e) {
          handleLogout();
        }
      }
    };
    
    checkAuth();
    // Check authentication status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUsername('');
  };
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/signin" />;
  };

  return (
    <Router>
      <div className="app">
        <header>
          <div className="header-content">
            <h1>Auction App</h1>
            {isAuthenticated && <p className="welcome-message">Welcome, {username}!</p>}
          </div>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Auctions</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/post-auction" className="nav-link">Post Auction</Link>
                <button 
                  onClick={handleLogout} 
                  className="nav-link logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="nav-link">Sign In</Link>
                <Link to="/signup" className="nav-link">Sign Up</Link>
              </>
            )}
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} /> : <Navigate to="/dashboard" />} />
            <Route path="/signin" element={!isAuthenticated ? <Signin setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard isAuthenticated={isAuthenticated} />} />
            <Route path="/auction/:id" element={<AuctionItem isAuthenticated={isAuthenticated} />} />
            <Route path="/post-auction" element={
              <ProtectedRoute>
                <PostAuction />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer>
          <div className="footer-content">
            <div className="footer-info">
              <p>&copy; {new Date().getFullYear()} Auction App. All rights reserved.</p>
            </div>
            <div className="footer-links">
              <Link to="/terms" className="footer-link">Terms of Service</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;