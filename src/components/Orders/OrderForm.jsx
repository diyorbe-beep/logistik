import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
import './OrderForm.scss';

const OrderForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState([]);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    customerName: user?.username || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    weight: '',
    dimensions: '',
    description: '',
    specialInstructions: '',
    urgency: 'normal',
    insuranceRequired: false,
    estimatedValue: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    preferredDeliveryDate: '',
    preferredDeliveryTime: ''
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    calculateEstimatedPrice();
  }, [formData.origin, formData.destination, formData.weight, formData.urgency]);

  const fetchPricing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pricing`);
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const calculateEstimatedPrice = () => {
    if (!formData.origin || !formData.destination || !formData.weight) {
      setEstimatedPrice(0);
      setSelectedRoute(null);
      return;
    }

    // Find matching route
    const route = pricing.find(p => 
      p.route.toLowerCase().includes(formData.origin.toLowerCase()) &&
      p.route.toLowerCase().includes(formData.destination.toLowerCase())
    );

    if (route) {
      let basePrice = route.totalPrice;
      const weight = parseFloat(formData.weight) || 0;
      
      // Weight-based pricing (per kg)
      if (weight > 100) {
        basePrice += (weight - 100) * 1000; // 1000 so'm per extra kg
      }
      
      // Urgency multiplier
      if (formData.urgency === 'urgent') {
        basePrice *= 1.5;
      } else if (formData.urgency === 'express') {
        basePrice *= 2;
      }
      
      setEstimatedPrice(Math.round(basePrice));
      setSelectedRoute(route);
    } else {
      // Default pricing calculation
      const distance = 100; // Default distance
      const baseRate = 500; // per km
      let price = distance * baseRate;
      
      const weight = parseFloat(formData.weight) || 0;
      if (weight > 100) {
        price += (weight - 100) * 1000;
      }
      
      if (formData.urgency === 'urgent') {
        price *= 1.5;
      } else if (formData.urgency === 'express') {
        price *= 2;
      }
      
      setEstimatedPrice(Math.round(price));
      setSelectedRoute(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        ...formData,
        customerId: user.id,
        estimatedPrice,
        selectedRoute: selectedRoute?.id || null,
        status: 'Pending', // New status for customer orders
        orderType: 'customer_order',
        trackingNumber: `ORD${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(t('orderCreatedSuccess'));
        navigate('/profile');
      } else {
        const error = await response.json();
        alert(error.message || t('error'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form">
      <div className="order-form-header">
        <h1>{t('createOrder')}</h1>
        <p>{t('createOrderDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="order-form-content">
        {/* Shipment Details */}
        <div className="form-section">
          <h3>{t('shipmentDetails')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('origin')} *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                required
                placeholder={t('enterOrigin')}
              />
            </div>
            <div className="form-group">
              <label>{t('destination')} *</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                placeholder={t('enterDestination')}
              />
            </div>
            <div className="form-group">
              <label>{t('weight')} (kg) *</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
                min="0.1"
                step="0.1"
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label>{t('dimensions')}</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="L x W x H (cm)"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>{t('description')} *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder={t('enterDescription')}
            />
          </div>
          
          <div className="form-group">
            <label>{t('specialInstructions')}</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows="2"
              placeholder={t('enterSpecialInstructions')}
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="form-section">
          <h3>{t('deliveryOptions')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('urgency')} *</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                required
              >
                <option value="normal">{t('normal')} (3-5 {t('days')})</option>
                <option value="urgent">{t('urgent')} (1-2 {t('days')}) +50%</option>
                <option value="express">{t('express')} ({t('sameDay')}) +100%</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('preferredDeliveryDate')}</label>
              <input
                type="date"
                name="preferredDeliveryDate"
                value={formData.preferredDeliveryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>{t('preferredDeliveryTime')}</label>
              <select
                name="preferredDeliveryTime"
                value={formData.preferredDeliveryTime}
                onChange={handleInputChange}
              >
                <option value="">{t('anytime')}</option>
                <option value="morning">09:00 - 12:00</option>
                <option value="afternoon">12:00 - 17:00</option>
                <option value="evening">17:00 - 20:00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipient Information */}
        <div className="form-section">
          <h3>{t('recipientInformation')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('recipientName')} *</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                required
                placeholder={t('enterRecipientName')}
              />
            </div>
            <div className="form-group">
              <label>{t('recipientPhone')} *</label>
              <input
                type="tel"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleInputChange}
                required
                placeholder="+998 XX XXX XX XX"
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('recipientAddress')} *</label>
            <textarea
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleInputChange}
              required
              rows="2"
              placeholder={t('enterRecipientAddress')}
            />
          </div>
        </div>

        {/* Insurance */}
        <div className="form-section">
          <h3>{t('insurance')}</h3>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="insuranceRequired"
                checked={formData.insuranceRequired}
                onChange={handleInputChange}
              />
              <span>{t('insuranceRequired')}</span>
            </label>
          </div>
          {formData.insuranceRequired && (
            <div className="form-group">
              <label>{t('estimatedValue')} ({t('currency')})</label>
              <input
                type="number"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Price Estimation */}
        <div className="form-section price-section">
          <h3>{t('priceEstimation')}</h3>
          <div className="price-details">
            {selectedRoute && (
              <div className="route-info">
                <p><strong>{t('selectedRoute')}:</strong> {selectedRoute.route}</p>
                <p><strong>{t('distance')}:</strong> {selectedRoute.distance} km</p>
              </div>
            )}
            <div className="price-breakdown">
              <div className="price-item">
                <span>{t('basePrice')}:</span>
                <span>{estimatedPrice.toLocaleString()} {t('currency')}</span>
              </div>
              {formData.insuranceRequired && (
                <div className="price-item">
                  <span>{t('insurance')}:</span>
                  <span>{Math.round(estimatedPrice * 0.02).toLocaleString()} {t('currency')}</span>
                </div>
              )}
              <div className="price-total">
                <span><strong>{t('totalEstimated')}:</strong></span>
                <span><strong>{(estimatedPrice + (formData.insuranceRequired ? Math.round(estimatedPrice * 0.02) : 0)).toLocaleString()} {t('currency')}</strong></span>
              </div>
            </div>
            <p className="price-note">{t('priceNote')}</p>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="btn-secondary"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || !estimatedPrice}
            className="btn-primary"
          >
            {loading ? t('creating') : t('createOrder')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;