/**
 * Utility functions for shipment and order status handling
 */

/**
 * Returns the translation key for a given raw status string
 * @param {string} status - Raw status from backend (e.g., 'Pending', 'In Transit')
 * @returns {string} - Translation key
 */
export const getStatusKey = (status) => {
  if (!status) return null;
  
  switch (status) {
    case 'Pending': return 'pending';
    case 'Received': return 'received';
    case 'In Transit': return 'inTransit';
    case 'Delivered': return 'delivered';
    case 'Converted to Shipment': return 'convertedToShipment';
    case 'Completed': return 'completed';
    default: return null;
  }
};

/**
 * Translates a status using the provided translation function
 * @param {function} t - i18n translation function (t)
 * @param {string} status - Raw status string
 * @returns {string} - Translated status
 */
export const translateStatus = (t, status) => {
  const key = getStatusKey(status);
  return key ? t(key) : status;
};

/**
 * Returns the CSS class for a given status
 * @param {string} status - Raw status string
 * @returns {string} - CSS class name
 */
export const getStatusClass = (status) => {
  if (!status) return '';
  
  switch (status) {
    case 'Pending':
      return 'status-pending';
    case 'Received':
      return 'status-received';
    case 'In Transit':
      return 'status-in-transit';
    case 'Delivered':
      return 'status-delivered';
    case 'Converted to Shipment':
      return 'status-converted';
    case 'Completed':
      return 'status-completed';
    default:
      return '';
  }
};
