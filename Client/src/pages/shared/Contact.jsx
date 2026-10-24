import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Briefcase,
  Check,
  Loader2
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, TwitterIcon, SproutIcon } from '../../components/SocialIcons';
import { contactApi } from '../../services/contactApi';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'general',
    subject: 'General',
    customSubject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please provide a message.';
    } else if (formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalSubject = formData.subject === 'Other' && formData.customSubject.trim()
        ? formData.customSubject.trim()
        : (formData.subject || 'General Inquiry');

      await contactApi.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        userType: formData.userType || 'general',
        subject: finalSubject,
        message: formData.message.trim()
      });

      setSubmitted(true);
      toast.success("Thanks — your message has been sent directly to the Admin operations desk.", 'Message Delivered');
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'general',
        subject: 'General',
        customSubject: '',
        message: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Contact submission error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit contact message. Please try again.';
      toast.error(errMsg, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#F9FBF8',
        color: '#1F2937',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.6
      }}
    >
      {/* 1. HERO HEADER (MATCHING LANDING PAGE AESTHETICS) */}
      <section
        style={{
          background: 'linear-gradient(180deg, #E8F5E9 0%, #F9FBF8 100%)',
          borderBottom: '1px solid #E5E7EB',
          padding: '4.5rem clamp(1.25rem, 3vw, 2.5rem) 3.5rem'
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #BBF7D0',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#1B4D3E',
              boxShadow: '0 2px 6px rgba(27,77,62,0.06)',
              marginBottom: '1.25rem'
            }}
          >
            <SproutIcon size={16} color="#16A34A" />
            <span>किसान व ग्राहक सेवा केंद्र · DIRECT SUPPORT & ENQUIRIES</span>
          </div>

          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: '#1B4D3E',
              lineHeight: 1.2,
              margin: '0 0 1rem 0'
            }}
          >
            संपर्क सूत्र — Get in touch with us.
            <br />
            <span style={{ fontStyle: 'italic', color: '#059669', fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)' }}>
              हम सदैव आपकी सेवा में उपस्थित हैं
            </span>
          </h1>

          <p style={{ color: '#4B5563', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto' }}>
            Whether you are a farmer seeking KYC assistance, a wholesale buyer with custom freight requirements, or an institutional partner — our agrarian operations desk in Ahmedabad is here to assist you.
          </p>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN BALANCED CONTACT SECTION (1280px ALIGNED WITH NAVBAR) */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '3.5rem clamp(1.25rem, 3vw, 2.5rem) 5rem' }}>
        <style>{`
          @media (max-width: 960px) {
            .contact-layout-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
          .contact-input:focus {
            border-color: #10B981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14) !important;
          }
          .contact-social-btn:hover {
            background-color: #1B4D3E !important;
            color: #FFFFFF !important;
            transform: translateY(-2px);
          }
        `}</style>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 'clamp(2rem, 3vw, 3rem)',
            alignItems: 'start'
          }}
          className="contact-layout-grid"
        >
          {/* LEFT COLUMN: CONTACT CHANNELS, OFFICE & HOURS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Contact Channels Cards */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(27,77,62,0.05)'
              }}
            >
              <h2
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.28rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  margin: '0 0 1.25rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📞</span>
                <span>Direct Contact Channels</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Toll-Free Phone */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      TOLL-FREE KISAN HELPLINE
                    </div>
                    <a
                      href="tel:1800123456"
                      style={{
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        color: '#1B4D3E',
                        textDecoration: 'none',
                        display: 'block',
                        margin: '2px 0'
                      }}
                    >
                      1800-123-456
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      Mon – Sat, 9:00 AM – 6:00 PM IST (Hindi, Gujarati, Marathi, English)
                    </div>
                  </div>
                </div>

                {/* Support Email */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      OFFICIAL SUPPORT EMAIL
                    </div>
                    <a
                      href="mailto:support@farmerbandh.com"
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1B4D3E',
                        textDecoration: 'none',
                        display: 'block',
                        margin: '2px 0'
                      }}
                    >
                      support@farmerbandh.com
                    </a>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      Typical response time: Within 24 business hours
                    </div>
                  </div>
                </div>

                {/* Regional Office */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      REGIONAL OPERATIONS CENTER
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#1B4D3E', margin: '2px 0' }}>
                      FarmerBandh Platform Ltd.
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.45 }}>
                      APMC Market Yard Complex, Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat 380054, India
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels Row */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4B5563' }}>
                  Connect on Social:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href="https://instagram.com/farmerbandh"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FarmerBandh Instagram"
                    className="contact-social-btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Instagram"
                  >
                    <InstagramIcon size={16} />
                  </a>
                  <a
                    href="https://facebook.com/farmerbandh"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FarmerBandh Facebook"
                    className="contact-social-btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Facebook"
                  >
                    <FacebookIcon size={16} />
                  </a>
                  <a
                    href="https://twitter.com/farmerbandh"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="FarmerBandh X"
                    className="contact-social-btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#E8F5E9',
                      color: '#1B4D3E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Twitter / X"
                  >
                    <TwitterIcon size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Farm Trust Card with Authentic Photo */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 4px 16px rgba(27,77,62,0.05)'
              }}
            >
              <div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '16 / 10'
                }}
              >
                <img
                  src="/images/about/trade-handshake.jpg"
                  alt="FarmerBandh verified direct trade in mandi"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(27,77,62,0.85) 100%)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    color: '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
                    विश्वास और शुद्धता का पक्का नाता
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1rem', fontWeight: 700 }}>
                    Direct Trade Desk · Zero Middlemen
                  </div>
                </div>
              </div>
              <div style={{ padding: '10px 4px 4px', fontSize: '0.82rem', color: '#6B7280', fontStyle: 'italic' }}>
                "Our field officers are physically present across APMC mandis in Gujarat to assist farmers with produce grading and digital contracts."
              </div>
            </div>

            {/* Response SLA Guarantee Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1B4D3E 0%, #12382C 100%)',
                color: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <ShieldCheck size={28} color="#A7F3D0" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  Guaranteed 24h Ticket SLA
                </div>
                <div style={{ fontSize: '0.78rem', color: '#D1FAE5', marginTop: '2px' }}>
                  Every farmer and buyer enquiry is logged into our trackable operational queue.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RICH CLEAN CONTACT FORM */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '2.25rem',
              boxShadow: '0 8px 24px rgba(27,77,62,0.06)',
              position: 'relative'
            }}
          >
            {/* Form Header */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#E8F5E9',
                  border: '1px solid #BBF7D0',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  marginBottom: '0.75rem'
                }}
              >
                <SproutIcon size={14} color="#16A34A" />
                <span>संदेश भेजें · WRITE TO OUR DESK</span>
              </div>
              <h2
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  color: '#1B4D3E',
                  margin: '0 0 0.5rem 0'
                }}
              >
                Send Us a Message
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.94rem', margin: 0 }}>
                Please share your details below. Your request will be directly routed to our agricultural support officers.
              </p>
            </div>

            {submitted && (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  color: '#065F46',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <CheckCircle2 size={20} color="#059669" />
                <span>
                  संदेश प्राप्त हुआ! Thank you. Your message has been logged. We typically respond within 24 hours on business days.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* User Role Selector */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#1B4D3E',
                    marginBottom: '0.5rem'
                  }}
                >
                  I am reaching out as a: (आप कौन हैं?)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'general', label: '💬 Visitor / Any Person' },
                    { id: 'farmer', label: '🧑‍🌾 Farmer / Producer' },
                    { id: 'buyer', label: '🛒 Wholesale Buyer' },
                    { id: 'partner', label: '🤝 Partner / Other' }
                  ].map((role) => {
                    const isSelected = formData.userType === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: role.id })}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #1B4D3E' : '1px solid #E5E7EB',
                          backgroundColor: isSelected ? '#1B4D3E' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#374151',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(27,77,62,0.2)' : 'none'
                        }}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two-Column Grid: Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '0.35rem'
                    }}
                  >
                    Full Name (पूरा नाम) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="contact-input"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: '10px',
                      border: errors.name ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  {errors.name && (
                    <span style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    style={{
                      display: 'block',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '0.35rem'
                    }}
                  >
                    Phone Number (फ़ोन नंबर) <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>(Optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="contact-input"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: '10px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="contact-email"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.35rem'
                  }}
                >
                  Email Address (ईमेल पता) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. yourname@domain.com"
                  className="contact-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    border: errors.email ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                />
                {errors.email && (
                  <span style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Subject Dropdown */}
              <div>
                <label
                  htmlFor="contact-subject"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.35rem'
                  }}
                >
                  Enquiry Subject (पूछताछ का विषय)
                </label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <option value="General">General Platform Information (सामान्य जानकारी)</option>
                  <option value="FarmerKYC">Farmer Registration & 7/12 KYC (किसान पंजीकरण)</option>
                  <option value="Partnership">Wholesale Buying & Bulk Freight (थोक व्यापार)</option>
                  <option value="Payouts">Bank Payouts & NEFT Escrow (भुगतान सहायता)</option>
                  <option value="Dispute">Produce Quality & Return Support (शिकायत समाधान)</option>
                  <option value="Other">Write Custom Topic / Other (अन्य कोई विषय)...</option>
                </select>

                {formData.subject === 'Other' && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <label
                      htmlFor="contact-custom-subject"
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#1B4D3E',
                        marginBottom: '0.35rem'
                      }}
                    >
                      Specify Your Topic (अपना विषय लिखें):
                    </label>
                    <input
                      id="contact-custom-subject"
                      type="text"
                      value={formData.customSubject || ''}
                      onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                      placeholder="e.g. Question about bulk delivery, app feedback, partnership inquiry..."
                      className="contact-input"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.95rem',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  style={{
                    display: 'block',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.35rem'
                  }}
                >
                  Your Message (संदेश विवरण) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our operations team assist you? Please describe in detail (min 10 characters)..."
                  className="contact-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    border: errors.message ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                />
                {errors.message && (
                  <span style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: '3px', display: 'block' }}>
                    {errors.message}
                  </span>
                )}
              </div>

              {/* Submit Button & Confidential Note */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#9CA3AF' : '#1B4D3E',
                    color: '#FFFFFF',
                    padding: '0.9rem 2.4rem',
                    borderRadius: '9999px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(27,77,62,0.25)',
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting (भेजा जा रहा है...)...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Message (संदेश भेजें)</span>
                      <Send size={15} />
                    </>
                  )}
                </button>

                <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#059669" />
                  <span>Your enquiry is logged securely under our Privacy Policy. Never shared with third parties.</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. SECTION: QUICK RESOLUTION SHORTCUTS (1280px ALIGNED WITH NAVBAR) */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
          padding: '4.5rem clamp(1.25rem, 3vw, 2.5rem)'
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              त्वरित सहायता · IMMEDIATE ANSWERS
            </span>
            <h2
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                fontWeight: 700,
                color: '#1B4D3E',
                margin: '0 0 0.5rem 0'
              }}
            >
              Looking for Immediate Answers?
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
              Save time — common trading queries resolved in our Knowledge Base.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.75rem',
              marginBottom: '2.5rem'
            }}
          >
            <div
              style={{
                backgroundColor: '#F9FBF8',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 0.5rem 0' }}>
                How does 48-hour price negotiation work?
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Click "Negotiate Price" on any harvest listing, submit your offer per quintal, and the farmer can accept, counter, or decline within 48h.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F9FBF8',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📜</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 0.5rem 0' }}>
                How are farmer identities & land verified?
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Farmers submit government photo ID and 7/12 land records under Seller Hub. Our admin team physically and digitally validates each claim.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F9FBF8',
                border: '1px solid #E5E7EB',
                borderRadius: '14px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>⚖️</div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#1B4D3E', margin: '0 0 0.5rem 0' }}>
                What happens during crop grade disputes?
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                If delivery fails grade criteria, buyers can raise a return ticket within 48 hours with photographic evidence for neutral dispute arbitration.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/help"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1B4D3E',
                fontWeight: 700,
                fontSize: '0.96rem',
                textDecoration: 'none',
                backgroundColor: '#E8F5E9',
                padding: '10px 24px',
                borderRadius: '9999px',
                border: '1px solid #BBF7D0',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Explore complete Help Desk & Knowledge Base</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
