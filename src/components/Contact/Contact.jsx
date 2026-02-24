import { useState } from 'react';
import { Icons } from '../Icons/Icons';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      alert('Xabar yuborildi!');
    }, 1000);
  };

  return (
    <div className="contact-page-modern">
      <div className="container">
        <div className="contact-header">
          <h1>Biz bilan bog'laning</h1>
          <p>
            Savollaringiz bormi? Biz sizga yordam berishdan mamnunmiz. Quyidagi ma'lumotlar orqali biz
            bilan bog'lanishingiz yoki xabar qoldirishingiz mumkin.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Column: Form */}
          <div className="contact-form-card">
            <div className="card-header">
              <h2>Xabar qoldirish</h2>
              <p>Formani to'ldiring va biz siz bilan tez orada bog'lanamiz</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ism</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ismingizni kiriting"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email manzilingizni kiriting"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Telefon raqamingizni kiriting"
                />
              </div>

              <div className="form-group">
                <label>Xabar</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Xabaringizni kiriting"
                  rows="5"
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Yuborilmoqda...' : 'Xabar yuborish'}
              </button>
            </form>
          </div>

          {/* Right Column: Info & Map */}
          <div className="contact-sidebar">
            <div className="info-card">
              <div className="card-header">
                <h2>Bog'lanish ma'lumotlari</h2>
                <p>Bizning manzil va bog'lanish uchun ma'lumotlar</p>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <Icons.MapPin className="icon" size={20} />
                  <div className="details">
                    <h4>Manzil</h4>
                    <p>Toshkent shahri, Mirobod tumani, Amir Temur ko'chasi, 108-uy</p>
                  </div>
                </div>

                <div className="info-item">
                  <Icons.Phone className="icon" size={20} />
                  <div className="details">
                    <h4>Telefon</h4>
                    <p>+998 (90) 123-45-67</p>
                    <p>+998 (71) 234-56-78</p>
                  </div>
                </div>

                <div className="info-item">
                  <Icons.Mail className="icon" size={20} />
                  <div className="details">
                    <h4>Email</h4>
                    <p>info@logistika.uz</p>
                    <p>support@logistika.uz</p>
                  </div>
                </div>

                <div className="info-item">
                  <Icons.Clock className="icon" size={20} />
                  <div className="details">
                    <h4>Ish vaqti</h4>
                    <p>Dushanba - Juma: 9:00 - 18:00</p>
                    <p>Shanba: 9:00 - 15:00</p>
                    <p>Yakshanba: Dam olish kuni</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="map-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.885640700543!2d69.28189537651717!3d41.31139410069399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b2d1ad0401d%3A0x629c3666f8303f7e!2sAmir%20Temur%20Avenue%2C%20Tashkent!5e0!3m2!1sen!2suz!4v1700000000000!5m2!1sen!2suz"
                title="Google Maps"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
