import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
import { Icons } from '../Icons/Icons';
import Loading from '../Loading/Loading';
import './OrderForm.scss';

const OrderForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Pickup Information
    origin: '',
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',
    pickupContactName: user?.username || '',
    pickupContactPhone: user?.phone || '',

    // Delivery Information
    destination: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    deliveryDate: '',
    deliveryInstructions: '',

    // Package Information
    weight: '',
    dimensions: '',
    description: '',
    packageType: 'standard',
    packageValue: '',

    // Service Options
    urgency: 'standard',
    insurance: false,
    signature: false,
    fragile: false,
    specialInstructions: ''
  });

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        pickupContactName: user.username || '',
        pickupContactPhone: user.phone || ''
      }));
    }
  }, [user]);

  // Calculate estimated price
  useEffect(() => {
    if (formData.weight && formData.origin && formData.destination) {
      const price = calculatePrice();
      setEstimatedPrice(price);
    }
  }, [formData.weight, formData.urgency, formData.insurance, formData.packageValue]);

  const calculatePrice = () => {
    let basePrice = 50000; // Base price in UZS

    // Weight-based pricing
    const weight = parseFloat(formData.weight) || 0;
    if (weight > 1) basePrice += (weight - 1) * 15000;
    if (weight > 10) basePrice += (weight - 10) * 10000;

    // Urgency multiplier
    if (formData.urgency === 'express') basePrice *= 1.5;
    if (formData.urgency === 'urgent') basePrice *= 2.2;

    // Insurance
    if (formData.insurance && formData.packageValue) {
      const value = parseFloat(formData.packageValue) || 0;
      basePrice += value * 0.02; // 2% of package value
    }

    // Additional services
    if (formData.signature) basePrice += 10000;
    if (formData.fragile) basePrice += 15000;

    return Math.round(basePrice);
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1: // Pickup Information
        if (!formData.origin.trim()) newErrors.origin = t('requiredOrigin');
        if (!formData.pickupAddress.trim()) newErrors.pickupAddress = t('requiredAddress');
        if (!formData.pickupDate) newErrors.pickupDate = t('requiredDate');
        if (!formData.pickupContactName.trim()) newErrors.pickupContactName = t('requiredContact');
        if (!formData.pickupContactPhone.trim()) newErrors.pickupContactPhone = t('requiredPhone');
        break;

      case 2: // Delivery Information
        if (!formData.destination.trim()) newErrors.destination = t('requiredDestination');
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = t('requiredAddress');
        if (!formData.recipientName.trim()) newErrors.recipientName = t('requiredRecipient');
        if (!formData.recipientPhone.trim()) newErrors.recipientPhone = t('requiredPhone');
        break;

      case 3: // Package Information
        if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = t('requiredWeight');
        if (!formData.description.trim()) newErrors.description = t('requiredDescription');
        if (formData.insurance && (!formData.packageValue || parseFloat(formData.packageValue) <= 0)) {
          newErrors.packageValue = t('requiredInsuranceValue');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const orderData = {
        ...formData,
        estimatedPrice,
        trackingNumber: generateTrackingNumber(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
        customerId: user?.id
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
        setShowSuccess(true);

        // Redirect after success animation
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || t('orderCreateError') });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ submit: t('networkError') });
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    return 'LP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const steps = [
    { number: 1, title: t('pickupInfo'), icon: 'MapPin', description: t('pickupDesc') },
    { number: 2, title: t('deliveryInfo'), icon: 'Navigation', description: t('deliveryDesc') },
    { number: 3, title: t('packageInfo'), icon: 'Package', description: t('packageDesc') },
    { number: 4, title: t('confirmation'), icon: 'CheckCircle', description: t('confirmDesc') }
  ];

  if (loading) {
    return <Loading message={t('creating')} size="large" />;
  }

  if (showSuccess) {
    return (
      <div className="order-success">
        <div className="success-animation">
          <div className="success-icon">
            <Icons.CheckCircle size={80} color="#10b981" />
          </div>
          <h2>{t('orderSuccessTitle')}</h2>
          <p>{t('orderSuccessDesc')}</p>
          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`confetti-piece confetti-${i % 4}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <Icons.MapPin size={32} color="#3b82f6" />
              <div>
                <h3>{t('pickupInfo')} {t('orderDetails')}</h3>
                <p>{t('pickupDesc')}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="origin">{t('originRequired')}</label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder={t('enterOrigin')}
                  className={errors.origin ? 'error' : ''}
                />
                {errors.origin && <span className="error-text">{errors.origin}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="pickupAddress">{t('pickupAddress')} *</label>
                <input
                  type="text"
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder={t('enterAddress')}
                  required
                  className={errors.pickupAddress ? 'error' : ''}
                />
                {errors.pickupAddress && <span className="error-text">{errors.pickupAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupDate">{t('pickupDate')} *</label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.pickupDate ? 'error' : ''}
                />
                {errors.pickupDate && <span className="error-text">{errors.pickupDate}</span>}
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

              <div className="form-group">
                <label htmlFor="pickupContactName">{t('contactPerson')} *</label>
                <input
                  type="text"
                  id="pickupContactName"
                  name="pickupContactName"
                  value={formData.pickupContactName}
                  onChange={handleChange}
                  placeholder={t('enterContactName')}
                  required
                  className={errors.pickupContactName ? 'error' : ''}
                />
                {errors.pickupContactName && <span className="error-text">{errors.pickupContactName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupContactPhone">{t('phone')} *</label>
                <input
                  type="tel"
                  id="pickupContactPhone"
                  name="pickupContactPhone"
                  value={formData.pickupContactPhone}
                  onChange={handleChange}
                  placeholder="+998 90 123 45 67"
                  className={errors.pickupContactPhone ? 'error' : ''}
                />
                {errors.pickupContactPhone && <span className="error-text">{errors.pickupContactPhone}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <Icons.Navigation size={32} color="#10b981" />
              <div>
                <h3>{t('deliveryInfo')} {t('orderDetails')}</h3>
                <p>{t('deliveryDesc')}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="destination">{t('destinationRequired')}</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder={t('enterDestination')}
                  className={errors.destination ? 'error' : ''}
                />
                {errors.destination && <span className="error-text">{errors.destination}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="deliveryAddress">{t('deliveryAddress')} *</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder={t('enterRecipientAddress')}
                  rows="3"
                  className={errors.deliveryAddress ? 'error' : ''}
                />
                {errors.deliveryAddress && <span className="error-text">{errors.deliveryAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="recipientName">{t('recipient')} *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder={t('recipientName')}
                  className={errors.recipientName ? 'error' : ''}
                />
                {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
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
                  className={errors.recipientPhone ? 'error' : ''}
                />
                {errors.recipientPhone && <span className="error-text">{errors.recipientPhone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="deliveryDate">{t('deliveryDate')}</label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="deliveryInstructions">{t('deliveryInstructions')}</label>
                <textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleChange}
                  placeholder={t('additionalNotes')}
                  rows="2"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <Icons.Package size={32} color="#f59e0b" />
              <div>
                <h3>{t('packageInfo')}</h3>
                <p>{t('packageDesc')}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weight">{t('weight_kg')} *</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.5"
                  min="0.1"
                  step="0.1"
                  className={errors.weight ? 'error' : ''}
                />
                {errors.weight && <span className="error-text">{errors.weight}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dimensions">{t('dimensions')} (sm)</label>
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
                  <option value="standard">{t('standardPackage')}</option>
                  <option value="fragile">{t('fragilePackage')}</option>
                  <option value="electronics">{t('electronicsPackage')}</option>
                  <option value="documents">{t('documentsPackage')}</option>
                  <option value="food">{t('foodPackage')}</option>
                  <option value="clothing">{t('clothingPackage')}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">{t('urgency')}</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="standard">{t('urgencyStandard')}</option>
                  <option value="express">{t('urgencyExpress')}</option>
                  <option value="urgent">{t('urgencyUrgent')}</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">{t('description')} *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('enterDescription')}
                  rows="3"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="packageValue">{t('estimatedValue')} ({t('currency')})</label>
                <input
                  type="number"
                  id="packageValue"
                  name="packageValue"
                  value={formData.packageValue}
                  onChange={handleChange}
                  placeholder="1000000"
                  min="0"
                  className={errors.packageValue ? 'error' : ''}
                />
                {errors.packageValue && <span className="error-text">{errors.packageValue}</span>}
              </div>

              <div className="form-group full-width">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    {t('insuranceLabel')}
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="signature"
                      checked={formData.signature}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    {t('signatureLabel')}
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="fragile"
                      checked={formData.fragile}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    {t('fragileLabel')}
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="specialInstructions">{t('specialInstructions')}</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder={t('enterSpecialInstructions')}
                  rows="2"
                />
              </div>
            </div>

            {estimatedPrice > 0 && (
              <div className="price-estimate">
                <div className="price-card">
                  <h4>{t('estimatedPriceTitle')}</h4>
                  <div className="price-amount">{estimatedPrice.toLocaleString()} {t('currency')}</div>
                  <p>{t('priceNotice')}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <Icons.CheckCircle size={32} color="#8b5cf6" />
              <div>
                <h3>{t('confirmOrderTitle')}</h3>
                <p>{t('confirmOrderDesc')}</p>
              </div>
            </div>

            <div className="summary-sections">
              <div className="summary-section">
                <h4><Icons.MapPin size={20} /> {t('pickupInfo')}</h4>
                <div className="summary-content">
                  <p><strong>{t('from')}:</strong> {formData.origin}</p>
                  <p><strong>{t('address')}:</strong> {formData.pickupAddress}</p>
                  <p><strong>{t('sana')}:</strong> {formData.pickupDate} {formData.pickupTime && `soat ${formData.pickupTime}`}</p>
                  <p><strong>{t('contactPerson')}:</strong> {formData.pickupContactName} ({formData.pickupContactPhone})</p>
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.Navigation size={20} /> {t('deliveryInfo')}</h4>
                <div className="summary-content">
                  <p><strong>{t('to')}:</strong> {formData.destination}</p>
                  <p><strong>{t('address')}:</strong> {formData.deliveryAddress}</p>
                  <p><strong>{t('recipient')}:</strong> {formData.recipientName} ({formData.recipientPhone})</p>
                  {formData.deliveryDate && <p><strong>{t('sana')}:</strong> {formData.deliveryDate}</p>}
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.Package size={20} /> {t('packageInfo')}</h4>
                <div className="summary-content">
                  <p><strong>{t('weight')}:</strong> {formData.weight} kg</p>
                  <p><strong>{t('type')}:</strong> {t(formData.packageType + 'Package')}</p>
                  <p><strong>{t('description')}:</strong> {formData.description}</p>
                  <p><strong>{t('urgency')}:</strong> {t('urgency' + formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1))}</p>
                  {formData.dimensions && <p><strong>{t('dimensions')}:</strong> {formData.dimensions} sm</p>}
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.DollarSign size={20} /> {t('services')} {t('price')}</h4>
                <div className="summary-content">
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span>{t('basePrice')}:</span>
                      <span>{(estimatedPrice - (formData.signature ? 10000 : 0) - (formData.fragile ? 15000 : 0) - (formData.insurance && formData.packageValue ? Math.round(parseFloat(formData.packageValue) * 0.02) : 0)).toLocaleString()} {t('currency')}</span>
                    </div>
                    {formData.signature && (
                      <div className="price-item">
                        <span>{t('signatureLabel')}:</span>
                        <span>10,000 {t('currency')}</span>
                      </div>
                    )}
                    {formData.fragile && (
                      <div className="price-item">
                        <span>{t('fragileLabel')}:</span>
                        <span>15,000 {t('currency')}</span>
                      </div>
                    )}
                    {formData.insurance && (
                      <div className="price-item">
                        <span>{t('insurance')}:</span>
                        <span>{Math.round((parseFloat(formData.packageValue) || 0) * 0.02).toLocaleString()} {t('currency')}</span>
                      </div>
                    )}
                    <div className="price-item total">
                      <span><strong>{t('total')}:</strong></span>
                      <span><strong>{estimatedPrice.toLocaleString()} {t('currency')}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="error-message">
                <Icons.AlertCircle size={20} />
                {errors.submit}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="order-form-new">
      <div className="container">
        <div className="order-header">
          <h1>{t('createOrder')}</h1>
          <p>{t('createOrderDescription')}</p>
        </div>

        <div className="order-progress">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className={`progress-step ${step >= stepItem.number ? 'active' : ''} ${step > stepItem.number ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > stepItem.number ? (
                  <Icons.CheckCircle size={24} />
                ) : (
                  <span>{stepItem.number}</span>
                )}
              </div>
              <div className="step-info">
                <h4>{stepItem.title}</h4>
                <p>{stepItem.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="order-form-container">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="form-actions">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  <Icons.ArrowLeft size={20} />
                  {t('back')}
                </button>
              )}

              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  {t('continue')}
                  <Icons.ArrowRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary btn-large">
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      {t('creating')}
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle size={20} />
                      {t('createOrderSubmit')}
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