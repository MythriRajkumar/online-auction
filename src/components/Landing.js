import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

const Landing = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    closingSoon: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured items (most recent and highest bid)
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get('http://localhost:5001/auctions?limit=4&sort=currentBid&order=desc');
        // Handle both API response formats
        if (Array.isArray(response.data)) {
          setFeaturedItems(response.data.slice(0, 4));
        } else {
          setFeaturedItems(response.data.auctions || []);
        }
        
        // Get auction stats
        const allAuctions = await axios.get('http://localhost:5001/auctions?limit=100');
        let auctions = [];
        if (Array.isArray(allAuctions.data)) {
          auctions = allAuctions.data;
        } else {
          auctions = allAuctions.data.auctions || [];
        }
        
        const now = new Date();
        const activeAuctions = auctions.filter(item => !item.isClosed && new Date(item.closingTime) > now);
        const closingSoon = activeAuctions.filter(item => {
          const closing = new Date(item.closingTime);
          const hoursLeft = (closing - now) / (1000 * 60 * 60);
          return hoursLeft <= 24;
        });
        
        setStats({
          totalAuctions: auctions.length,
          activeAuctions: activeAuctions.length,
          closingSoon: closingSoon.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured items:', error);
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

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

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Find and Bid on Unique Items</h1>
          <p>Join our community of buyers and sellers in the most trusted online auction platform</p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn primary-btn">Browse Auctions</Link>
            <Link to="/signup" className="btn secondary-btn">Join Now</Link>
          </div>
        </div>
      </section>

      <section className="auction-stats">
        <div className="stat-box">
          <h3>{stats.totalAuctions}</h3>
          <p>Total Auctions</p>
        </div>
        <div className="stat-box">
          <h3>{stats.activeAuctions}</h3>
          <p>Active Auctions</p>
        </div>
        <div className="stat-box">
          <h3>{stats.closingSoon}</h3>
          <p>Closing Soon</p>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Auctions</h2>
        {loading ? (
          <div className="loading">Loading featured items...</div>
        ) : featuredItems.length === 0 ? (
          <div className="no-items">No featured auctions available at the moment.</div>
        ) : (
          <div className="featured-grid">
            {featuredItems.map((item) => (
              <div key={item._id} className="featured-card">
                <div className="featured-info">
                  <h3>{item.itemName}</h3>
                  <p className="description">{item.description.substring(0, 80)}...</p>
                  <div className="price-time">
                    <span className="price">${item.currentBid.toFixed(2)}</span>
                    <span className="time">{getTimeLeft(item.closingTime)}</span>
                  </div>
                  <Link to={`/auction/${item._id}`} className="view-btn">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/dashboard" className="view-all-btn">View All Auctions</Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Items</h3>
            <p>Explore our wide selection of items up for auction</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Register & Bid</h3>
            <p>Create an account and place your bids on items you want</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Win & Pay</h3>
            <p>If you're the highest bidder when the auction ends, the item is yours</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-container">
          <div className="testimonial">
            <p>"I found a rare collector's item that I had been searching for years. Great platform!"</p>
            <h4>- Sarah K.</h4>
          </div>
          <div className="testimonial">
            <p>"As a seller, I've been able to reach more buyers than ever before. Highly recommended!"</p>
            <h4>- Michael T.</h4>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start?</h2>
        <p>Join thousands of users buying and selling on our platform every day</p>
        <Link to="/signup" className="cta-button">Create an Account</Link>
      </section>
    </div>
  );
};

export default Landing;