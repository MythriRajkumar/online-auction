import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostAuction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingBid: '',
    category: 'Other',
    closingTime: '',
    images: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin', { state: { from: '/post-auction', message: 'Please sign in to post an auction' } });
    }
    
    // Set default closing time to 7 days from now
    const defaultClosingDate = new Date();
    defaultClosingDate.setDate(defaultClosingDate.getDate() + 7);
    
    // Format date string for datetime-local input (YYYY-MM-DDThh:mm)
    const formattedDate = defaultClosingDate.toISOString().slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      closingTime: formattedDate
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startingBid') {
      // Allow only numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user makes changes
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file count
    if (files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }
    
    // Check file size and type
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB max
      
      if (!isImage) {
        setError('Only image files are allowed');
        return false;
      }
      
      if (!isValidSize) {
        setError('Images must be smaller than 2MB');
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length !== files.length) return;
    
    // Create preview URLs
    const fileURLs = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(fileURLs);
    
    // For real implementation, you'd upload these to a server and get URLs back
    // This is a placeholder for demo purposes
    const imagePlaceholders = validFiles.map((file, index) => 
      `https://example.com/images/${Date.now()}-${index}.jpg`
    );
    
    setFormData({
      ...formData,
      images: imagePlaceholders
    });
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
    
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const validateForm = () => {
    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return false;
    }
    
    if (formData.itemName.trim().length < 3) {
      setError('Item name must be at least 3 characters');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return false;
    }
    
    if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
      setError('Starting bid must be greater than 0');
      return false;
    }
    
    if (!formData.closingTime) {
      setError('Closing time is required');
      return false;
    }
    
    const closingDate = new Date(formData.closingTime);
    const now = new Date();
    
    if (closingDate <= now) {
      setError('Closing time must be in the future');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/signin', { state: { from: '/post-auction', message: 'Please sign in to post an auction' } });
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5001/auction',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Auction posted successfully!');
      
      // Reset form after successful submission
      setFormData({
        itemName: '',
        description: '',
        startingBid: '',
        category: 'Other',
        closingTime: '',
        images: []
      });
      setPreviewImages([]);
      
      // Redirect to the new auction after a short delay
      setTimeout(() => {
        navigate(`/auction/${response.data.item._id}`);
      }, 2000);
      
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to post auction. Please try again later.');
      }
      console.error('Error posting auction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-auction-container">
      <h2>Post a New Auction</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="auction-form">
        <div className="form-group">
          <label htmlFor="itemName">Item Name *</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Enter item name"
            maxLength={100}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home & Garden</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a detailed description of your item"
            rows={5}
            maxLength={2000}
            required
          ></textarea>
          <div className="char-count">
            {formData.description.length}/2000 characters
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="startingBid">Starting Bid ($) *</label>
          <input
            type="text"
            id="startingBid"
            name="startingBid"
            value={formData.startingBid}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="closingTime">Auction End Date/Time *</label>
          <input
            type="datetime-local"
            id="closingTime"
            name="closingTime"
            value={formData.closingTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="images">Images (Optional, max 5)</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="file-input"
          />
          <p className="file-help">Upload up to 5 images, 2MB max each</p>
          
          {previewImages.length > 0 && (
            <div className="image-previews">
              {previewImages.map((url, index) => (
                <div key={index} className="image-preview-container">
                  <img src={url} alt={`Preview ${index + 1}`} className="image-preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn" 
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-group submit-group">
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Auction'}
          </button>
          
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostAuction;