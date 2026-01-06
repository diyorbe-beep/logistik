import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import { Icons } from '../Icons/Icons';
import './OrderForm.scss';

const OrderForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Pickup Information
    origin: '',
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    
    // Delivery Information
    destination: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    deliveryDate: '',
    
    // Package Information
    weight: '',
    dimensions: '',
    description: '',
    packageType: 'standard',
    
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    
    // Additional Options
    urgency: 'standard',
    insurance: false,
    specialInstructions: ''
  });

  const handleChange = (e) => {
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
      
      // Calculate estimated price based on weight and distance
      const estimatedPrice = calculatePrice(formData.weight, formData.urgency);
      
      const orderData = {
        ...formData,
        estimatedPrice,
        trackingNumber: generateTrackingNumber(),
        status: 'Pending'
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
        alert(t('orderCreatedSuccessfully'));
        navigate('/profile');
      } else {
        const error = await response.json();
        alert(error.message || t('orderCreationFailed'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('orderCreationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (weight, urgency) => {
    let basePrice = 50000; // Base price in UZS
    
    // Weight-based pricing
    if (weight > 10) basePrice += (weight - 10) * 2000;
    
    // Urgency multiplier
    if (urgency === 'express') basePrice *= 1.5;
    if (urgency === 'urgent') basePrice *= 2;
    
    return Math.round(basePrice);
  };

  const generateTrackingNumber = () => {
    return 'LP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h3>{t('pickupInformation')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="origin">{t('pickupCity')} *</label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder={t('enterPickupCity')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pickupAddress">{t('pickupAddress')} *</label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder={t('enterPickupAddress')}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pickupDate">{t('pickupDate')} *</label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pickupTime">{t('pickupTime')}</label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h3>{t('deliveryInformation')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="destination">{t('deliveryCity')} *</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder={t('enterDeliveryCity')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryAddress">{t('deliveryAddress')} *</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder={t('enterDeliveryAddress')}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientName">{t('recipientName')} *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder={t('enterRecipientName')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientPhone">{t('recipientPhone')} *</label>
                <input
                  type="tel"
                  id="recipientPhone"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryDate">{t('preferredDeliveryDate')}</label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h3>{t('packageInformation')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weight">{t('weight')} (kg) *</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.5"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dimensions">{t('dimensions')} (cm)</label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="20x15x10"
                />
              </div>
              <div className="form-group">
                <label htmlFor="packageType">{t('packageType')}</label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                >
                  <option value="standard">{t('standard')}</option>
                  <option value="fragile">{t('fragile')}</option>
                  <option value="electronics">{t('electronics')}</option>
                  <option value="documents">{t('documents')}</option>
                  <option value="food">{t('food')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">{t('packageDescription')} *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('enterPackageDescription')}
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="urgency">{t('deliveryUrgency')}</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="standard">{t('standard')} (3-5 {t('days')})</option>
                  <option value="express">{t('express')} (1-2 {t('days')})</option>
                  <option value="urgent">{t('urgent')} ({t('sameDay')})</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="insurance"
                    checked={formData.insurance}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  {t('addInsurance')}
                </label>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="form-step">
            <h3>{t('contactInformation')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customerName">{t('yourName')} *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder={t('enterYourName')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerEmail">{t('yourEmail')} *</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerPhone">{t('yourPhone')} *</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialInstructions">{t('specialInstructions')}</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder={t('enterSpecialInstructions')}
                  rows="3"
                />
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="order-summary">
              <h4>{t('orderSummary')}</h4>
              <div className="summary-item">
                <span>{t('route')}:</span>
                <span>{formData.origin} → {formData.destination}</span>
              </div>
              <div className="summary-item">
                <span>{t('weight')}:</span>
                <span>{formData.weight} kg</span>
              </div>
              <div className="summary-item">
                <span>{t('urgency')}:</span>
                <span>{t(formData.urgency)}</span>
              </div>
              <div className="summary-item total">
                <span>{t('estimatedPrice')}:</span>
                <span>{calculatePrice(formData.weight, formData.urgency).toLocaleString()} UZS</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="order-form-page">
      <div className="container">
        <div className="order-form-header">
          <h1>{t('createNewOrder')}</h1>
          <p>{t('fillOrderDetails')}</p>
        </div>

        <div className="order-form-container">
          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className={`progress-step ${step >= stepNumber ? 'active' : ''}`}>
                <div className="step-circle">
                  {step > stepNumber ? (
                    <Icons.CheckCircle size={20} />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className="step-label">
                  {stepNumber === 1 && t('pickup')}
                  {stepNumber === 2 && t('delivery')}
                  {stepNumber === 3 && t('package')}
                  {stepNumber === 4 && t('contact')}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="order-form">
            {renderStep()}

            <div className="form-actions">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  <Icons.ArrowLeft size={16} />
                  {t('previous')}
                </button>
              )}
              
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  {t('next')}
                  <Icons.ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {t('creating')}
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle size={16} />
                      {t('createOrder')}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;