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
        if (!formData.origin.trim()) newErrors.origin = 'Olib ketish shahri majburiy';
        if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'Olib ketish manzili majburiy';
        if (!formData.pickupDate) newErrors.pickupDate = 'Olib ketish sanasi majburiy';
        if (!formData.pickupContactName.trim()) newErrors.pickupContactName = 'Aloqa shaxsi majburiy';
        if (!formData.pickupContactPhone.trim()) newErrors.pickupContactPhone = 'Telefon raqami majburiy';
        break;
        
      case 2: // Delivery Information
        if (!formData.destination.trim()) newErrors.destination = 'Yetkazish shahri majburiy';
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Yetkazish manzili majburiy';
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Qabul qiluvchi ismi majburiy';
        if (!formData.recipientPhone.trim()) newErrors.recipientPhone = 'Qabul qiluvchi telefoni majburiy';
        break;
        
      case 3: // Package Information
        if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Og\'irlik majburiy va 0 dan katta bo\'lishi kerak';
        if (!formData.description.trim()) newErrors.description = 'Yuk tavsifi majburiy';
        if (formData.insurance && (!formData.packageValue || parseFloat(formData.packageValue) <= 0)) {
          newErrors.packageValue = 'Sug\'urta uchun yuk qiymati majburiy';
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
        setErrors({ submit: error.message || 'Buyurtma yaratishda xatolik yuz berdi' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ submit: 'Tarmoq xatosi. Qayta urinib ko\'ring.' });
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    return 'LP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const steps = [
    { number: 1, title: 'Olib ketish', icon: 'MapPin', description: 'Yuk olib ketish ma\'lumotlari' },
    { number: 2, title: 'Yetkazish', icon: 'Navigation', description: 'Yuk yetkazish ma\'lumotlari' },
    { number: 3, title: 'Yuk haqida', icon: 'Package', description: 'Yuk va xizmat turlari' },
    { number: 4, title: 'Tasdiqlash', icon: 'CheckCircle', description: 'Ma\'lumotlarni tekshirish' }
  ];

  if (loading) {
    return <Loading message="Buyurtma yaratilmoqda..." size="large" />;
  }

  if (showSuccess) {
    return (
      <div className="order-success">
        <div className="success-animation">
          <div className="success-icon">
            <Icons.CheckCircle size={80} color="#10b981" />
          </div>
          <h2>Buyurtma muvaffaqiyatli yaratildi!</h2>
          <p>Tez orada siz bilan bog'lanamiz</p>
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
                <h3>Olib ketish ma'lumotlari</h3>
                <p>Yuk qayerdan olib ketilishini belgilang</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="origin">Olib ketish shahri *</label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Masalan: Toshkent"
                  className={errors.origin ? 'error' : ''}
                />
                {errors.origin && <span className="error-text">{errors.origin}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="pickupAddress">To'liq manzil *</label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Ko'cha, uy raqami, orientir..."
                  rows="3"
                  className={errors.pickupAddress ? 'error' : ''}
                />
                {errors.pickupAddress && <span className="error-text">{errors.pickupAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupDate">Olib ketish sanasi *</label>
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
                <label htmlFor="pickupTime">Olib ketish vaqti</label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickupContactName">Aloqa shaxsi *</label>
                <input
                  type="text"
                  id="pickupContactName"
                  name="pickupContactName"
                  value={formData.pickupContactName}
                  onChange={handleChange}
                  placeholder="Ism familiya"
                  className={errors.pickupContactName ? 'error' : ''}
                />
                {errors.pickupContactName && <span className="error-text">{errors.pickupContactName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pickupContactPhone">Telefon raqami *</label>
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
                <h3>Yetkazish ma'lumotlari</h3>
                <p>Yuk qayerga yetkazilishini belgilang</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="destination">Yetkazish shahri *</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Masalan: Samarqand"
                  className={errors.destination ? 'error' : ''}
                />
                {errors.destination && <span className="error-text">{errors.destination}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="deliveryAddress">To'liq manzil *</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Ko'cha, uy raqami, orientir..."
                  rows="3"
                  className={errors.deliveryAddress ? 'error' : ''}
                />
                {errors.deliveryAddress && <span className="error-text">{errors.deliveryAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="recipientName">Qabul qiluvchi *</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Ism familiya"
                  className={errors.recipientName ? 'error' : ''}
                />
                {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="recipientPhone">Qabul qiluvchi telefoni *</label>
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
                <label htmlFor="deliveryDate">Yetkazish sanasi</label>
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
                <label htmlFor="deliveryInstructions">Yetkazish bo'yicha ko'rsatmalar</label>
                <textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleChange}
                  placeholder="Qo'shimcha ma'lumotlar..."
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
                <h3>Yuk va xizmat turlari</h3>
                <p>Yuk haqida ma'lumot va qo'shimcha xizmatlar</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="weight">Og'irligi (kg) *</label>
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
                <label htmlFor="dimensions">O'lchamlari (sm)</label>
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
                <label htmlFor="packageType">Yuk turi</label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                >
                  <option value="standard">Oddiy</option>
                  <option value="fragile">Mo'rt</option>
                  <option value="electronics">Elektronika</option>
                  <option value="documents">Hujjatlar</option>
                  <option value="food">Oziq-ovqat</option>
                  <option value="clothing">Kiyim</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Yetkazish tezligi</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="standard">Oddiy (3-5 kun)</option>
                  <option value="express">Tez (1-2 kun)</option>
                  <option value="urgent">Shoshilinch (1 kun)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Yuk tavsifi *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Yuk haqida batafsil ma'lumot..."
                  rows="3"
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="packageValue">Yuk qiymati (UZS)</label>
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
                    Sug'urta (yuk qiymatining 2%)
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="signature"
                      checked={formData.signature}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Imzo bilan qabul qilish (+10,000 UZS)
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="fragile"
                      checked={formData.fragile}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Mo'rt yuk (+15,000 UZS)
                  </label>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="specialInstructions">Maxsus ko'rsatmalar</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Qo'shimcha talablar..."
                  rows="2"
                />
              </div>
            </div>

            {estimatedPrice > 0 && (
              <div className="price-estimate">
                <div className="price-card">
                  <h4>Taxminiy narx</h4>
                  <div className="price-amount">{estimatedPrice.toLocaleString()} UZS</div>
                  <p>Aniq narx operator tomonidan tasdiqlanadi</p>
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
                <h3>Ma'lumotlarni tasdiqlash</h3>
                <p>Barcha ma'lumotlarni tekshiring va buyurtmani yarating</p>
              </div>
            </div>

            <div className="summary-sections">
              <div className="summary-section">
                <h4><Icons.MapPin size={20} /> Olib ketish</h4>
                <div className="summary-content">
                  <p><strong>Shahar:</strong> {formData.origin}</p>
                  <p><strong>Manzil:</strong> {formData.pickupAddress}</p>
                  <p><strong>Sana:</strong> {formData.pickupDate} {formData.pickupTime && `soat ${formData.pickupTime}`}</p>
                  <p><strong>Aloqa:</strong> {formData.pickupContactName} ({formData.pickupContactPhone})</p>
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.Navigation size={20} /> Yetkazish</h4>
                <div className="summary-content">
                  <p><strong>Shahar:</strong> {formData.destination}</p>
                  <p><strong>Manzil:</strong> {formData.deliveryAddress}</p>
                  <p><strong>Qabul qiluvchi:</strong> {formData.recipientName} ({formData.recipientPhone})</p>
                  {formData.deliveryDate && <p><strong>Sana:</strong> {formData.deliveryDate}</p>}
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.Package size={20} /> Yuk ma'lumotlari</h4>
                <div className="summary-content">
                  <p><strong>Og'irligi:</strong> {formData.weight} kg</p>
                  <p><strong>Turi:</strong> {formData.packageType}</p>
                  <p><strong>Tavsif:</strong> {formData.description}</p>
                  <p><strong>Tezlik:</strong> {formData.urgency}</p>
                  {formData.dimensions && <p><strong>O'lcham:</strong> {formData.dimensions} sm</p>}
                </div>
              </div>

              <div className="summary-section">
                <h4><Icons.DollarSign size={20} /> Xizmatlar va narx</h4>
                <div className="summary-content">
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span>Asosiy xizmat:</span>
                      <span>{(estimatedPrice - (formData.signature ? 10000 : 0) - (formData.fragile ? 15000 : 0)).toLocaleString()} UZS</span>
                    </div>
                    {formData.signature && (
                      <div className="price-item">
                        <span>Imzo bilan qabul:</span>
                        <span>10,000 UZS</span>
                      </div>
                    )}
                    {formData.fragile && (
                      <div className="price-item">
                        <span>Mo'rt yuk:</span>
                        <span>15,000 UZS</span>
                      </div>
                    )}
                    {formData.insurance && (
                      <div className="price-item">
                        <span>Sug'urta:</span>
                        <span>{Math.round((parseFloat(formData.packageValue) || 0) * 0.02).toLocaleString()} UZS</span>
                      </div>
                    )}
                    <div className="price-item total">
                      <span><strong>Jami:</strong></span>
                      <span><strong>{estimatedPrice.toLocaleString()} UZS</strong></span>
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
          <h1>Yangi buyurtma yaratish</h1>
          <p>Yuk tashish xizmatidan foydalanish uchun quyidagi ma'lumotlarni to'ldiring</p>
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
                  Orqaga
                </button>
              )}
              
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Davom etish
                  <Icons.ArrowRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn-primary btn-large">
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle size={20} />
                      Buyurtmani yaratish
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