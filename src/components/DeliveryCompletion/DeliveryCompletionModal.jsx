import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './DeliveryCompletionModal.scss';

const DeliveryCompletionModal = ({ isOpen, onClose, shipment, onDeliveryComplete }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryCode: '',
    deliveryNotes: '',
    recipientName: '',
    deliveryPhoto: null
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        deliveryPhoto: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.deliveryCode.trim()) {
      alert(t('deliveryCodeRequired'));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create delivery completion data
      const deliveryData = {
        deliveryCode: formData.deliveryCode.trim(),
        deliveryNotes: formData.deliveryNotes.trim(),
        recipientName: formData.recipientName.trim() || shipment.recipientName,
        deliveredAt: new Date().toISOString(),
        deliveredBy: 'carrier', // Current user role
        status: 'Delivered'
      };

      const response = await fetch(`${API_URL}/api/shipments/${shipment.id}/complete-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(deliveryData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success animation
        setShowSuccess(true);
        
        // Wait for animation, then close modal and refresh data
        setTimeout(() => {
          setShowSuccess(false);
          onDeliveryComplete(result);
          onClose();
          resetForm();
        }, 3000);
        
      } else {
        const error = await response.json();
        alert(error.message || t('deliveryCompletionFailed'));
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert(t('deliveryCompletionFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryCode: '',
      deliveryNotes: '',
      recipientName: '',
      deliveryPhoto: null
    });
  };

  const handleClose = () => {
    if (!loading && !showSuccess) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="delivery-modal-overlay" onClick={handleClose}>
      <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <div className="success-animation">
            <div className="success-icon">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
            <h2>{t('congratulations')}</h2>
            <p>{t('deliveryCompletedSuccessfully')}</p>
            <div className="confetti">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`confetti-piece confetti-${i % 4}`}></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>{t('completeDelivery')}</h2>
              <button className="close-btn" onClick={handleClose} disabled={loading}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="shipment-info">
                <h3>{t('shipmentDetails')}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">{t('trackingNumber')}:</span>
                    <span className="value">#{shipment.trackingNumber || shipment.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{t('destination')}:</span>
                    <span className="value">{shipment.destination}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">{t('recipient')}:</span>
                    <span className="value">{shipment.recipientName || shipment.customerName}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="delivery-form">
                <div className="form-group">
                  <label htmlFor="deliveryCode">
                    {t('deliveryCode')} *
                    <span className="help-text">{t('deliveryCodeHelp')}</span>
                  </label>
                  <input
                    type="text"
                    id="deliveryCode"
                    name="deliveryCode"
                    value={formData.deliveryCode}
                    onChange={handleInputChange}
                    placeholder={t('enterDeliveryCode')}
                    required
                    disabled={loading}
                    maxLength="20"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recipientName">
                    {t('actualRecipientName')}
                    <span className="help-text">{t('actualRecipientHelp')}</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder={shipment.recipientName || shipment.customerName}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryNotes">
                    {t('deliveryNotes')}
                    <span className="help-text">{t('deliveryNotesHelp')}</span>
                  </label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    placeholder={t('enterDeliveryNotes')}
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryPhoto">
                    {t('deliveryPhoto')} ({t('optional')})
                    <span className="help-text">{t('deliveryPhotoHelp')}</span>
                  </label>
                  <input
                    type="file"
                    id="deliveryPhoto"
                    name="deliveryPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={loading}
                    className="file-input"
                  />
                  {formData.deliveryPhoto && (
                    <div className="file-preview">
                      <span>📷 {formData.deliveryPhoto.name}</span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !formData.deliveryCode.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        {t('completing')}
                      </>
                    ) : (
                      <>
                        <span>✅</span>
                        {t('completeDelivery')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryCompletionModal;