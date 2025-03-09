import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ isAuthenticated }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchItems();
  }, [currentPage, category, status]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 10);
      
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`http://localhost:5001/auctions?${params.toString()}`);
      
      // Handle both the old API format (array) and new format (object with auctions array)
      if (Array.isArray(response.data)) {
        // Old API format
        setItems(response.data);
        setTotalPages(1);
      } else {
        // New API format with pagination
        setItems(response.data.auctions || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError('Failed to load auctions. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchItems();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getTimeLeft = (closingTime) => {
    const now = new Date();
    const closing = new Date(closingTime);
    const timeLeft = closing - now;

    if (timeLeft <= 0) return 'Ended';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) return <div className="loading">Loading auctions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Available Auctions</h2>
      
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search auctions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        
        <div className="filter-controls">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home & Garden</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Other">Other</option>
          </select>
          
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="no-items">No auctions available matching your criteria.</div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="auction-card">
              <h3>{item.itemName}</h3>
              <p className="description">{item.description.substring(0, 100)}...</p>
              <div className="auction-details">
                <p className="current-bid">Current bid: ${item.currentBid.toFixed(2)}</p>
                <p className="time-left">{getTimeLeft(item.closingTime)}</p>
              </div>
              {item.highestBidder && (
                <p className="highest-bidder">Highest bidder: {item.highestBidder}</p>
              )}
              <Link to={`/auction/${item._id}`} className="view-button">
                View Auction
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="page-button"
          >
            Previous
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;