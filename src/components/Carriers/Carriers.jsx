import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import api from '../../api/client';
import { Icons } from '../Icons/Icons';
import './Carriers.scss';

const Carriers = () => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      const response = await api.get('/carriers');
      setCarriers(response.data);
    } catch (err) {
      console.error('Error fetching carriers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarrierHistory = async (carrierId) => {
    try {
      const response = await api.get(`/carriers/${carrierId}/history`);
      setSelectedCarrier({ ...carriers.find(c => c.id === carrierId), history: response.data });
    } catch (err) {
      console.error('Error fetching carrier history:', err);
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingCarriers')}</div>;
  }

  return (
    <div className="carriers-page">
      <div className="carriers-header">
        <h1>{t('carriers')}</h1>
      </div>

      {carriers.length === 0 ? (
        <div className="empty-state">
          <p>{t('noCarriers')}</p>
        </div>
      ) : (
        <div className="carriers-content">
          <div className="carriers-list">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`carrier-card ${selectedCarrier?.id === carrier.id ? 'active' : ''}`}
                onClick={() => fetchCarrierHistory(carrier.id)}
              >
                <div className="carrier-avatar">
                  <Icons.Truck size={32} color="#2563eb" />
                </div>
                <div className="carrier-info">
                  <h3>{carrier.name || carrier.username}</h3>
                  <p className="carrier-phone">{carrier.phone || carrier.email}</p>
                  <div className="carrier-stats">
                    <span>{t('totalShipments')}: {carrier.totalShipments || 0}</span>
                    <span>{t('completedShipments')}: {carrier.completedShipments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCarrier && (
            <div className="carrier-details">
              <div className="details-header">
                <h2>{selectedCarrier.name || selectedCarrier.username}</h2>
                <button onClick={() => setSelectedCarrier(null)} className="close-btn">
                  <Icons.Close size={20} />
                </button>
              </div>
              <div className="details-info">
                <div className="info-item">
                  <span className="label">{t('phone')}:</span>
                  <span className="value">{selectedCarrier.phone || t('nA')}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('email')}:</span>
                  <span className="value">{selectedCarrier.email || t('nA')}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('carrierVehicle')}:</span>
                  <span className="value">{selectedCarrier.vehicleType || t('nA')}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('carrierStatus')}:</span>
                  <span className="value status-active">{t('active')}</span>
                </div>
              </div>
              <div className="work-history">
                <h3>{t('workHistory')}</h3>
                {selectedCarrier.history && selectedCarrier.history.length > 0 ? (
                  <div className="history-list">
                    {selectedCarrier.history.map((item) => (
                      <div key={item.id} className="history-item">
                        <div className="history-header">
                          <span className="shipment-id">#{item.shipmentId}</span>
                          <span className="history-date">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="history-route">{item.from} → {item.to}</p>
                        <span className={`history-status ${getStatusClass(item.status)}`}>
                          {translateStatus(t, item.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">{t('noHistory')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Carriers;




