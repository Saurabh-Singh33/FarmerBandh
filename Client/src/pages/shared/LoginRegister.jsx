import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ShoppingCart, Tractor, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../context/NotificationContext';

export const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('buyer'); // 'buyer' or 'farmer'

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [city, setCity] = useState('Ahmedabad');
  const [farmName, setFarmName] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = (userRole) => {
    const r = (userRole || '').toLowerCase();
    if (r === 'buyer') {
      navigate('/marketplace');
    } else if (r === 'farmer' || r === 'seller') {
      navigate('/seller/dashboard');
    } else if (r === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setErrorMessage('Unrecognized user role');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      setSuccessMessage('Sign in successful!');
      setTimeout(() => {
        handleRedirect(response.role);
      }, 300);
    } catch (err) {
      const apiErr = err.response?.data?.error || err.message || 'Invalid credentials';
      setErrorMessage(apiErr);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        password,
        role,
        state,
        district,
        city,
        farmName: role === 'farmer' ? farmName : null,
      };

      const response = await register(payload);
      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        handleRedirect(response.role);
      }, 300);
    } catch (err) {
      const apiErr = err.response?.data?.error || err.message || 'Registration failed';
      setErrorMessage(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 65px)',
      backgroundColor: '#F9FBF8',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Left Split Panel - Forest Green with Serif Brand Heading */}
      <div style={{
        flex: 1,
        backgroundColor: '#1B4D3E',
        color: '#FFFFFF',
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.12)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '2rem'
          }}>
            <Sprout size={16} color="#FFFFFF" /> Direct Local Produce Marketplace
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '3rem',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            color: '#F9FBF8'
          }}>
            Trade directly.<br />Grow together.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: '#D1E7DD',
            maxWidth: '460px'
          }}>
            Connect farmers directly with local buyers in Gujarat and beyond. No middlemen, transparent pricing, and farm-fresh quality delivered to your community.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E8F5E9' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: '#A3D9C9' }}>Direct Payments</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E8F5E9' }}>Local</div>
            <div style={{ fontSize: '0.85rem', color: '#A3D9C9' }}>State & District Filters</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E8F5E9' }}>Verified</div>
            <div style={{ fontSize: '0.85rem', color: '#A3D9C9' }}>Farmer Listings</div>
          </div>
        </div>

        {/* Decorative background shape */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Right Split Panel - Form Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E5E7EB'
        }}>
          {/* Tab Selection */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F3F4F6',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.8rem'
          }}>
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'login' ? '#1B4D3E' : '#6B7280',
                fontWeight: activeTab === 'login' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'login' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'register' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'register' ? '#1B4D3E' : '#6B7280',
                fontWeight: activeTab === 'register' ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Create account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1.2rem',
              fontWeight: 500
            }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1.2rem',
              fontWeight: 500
            }}>
              {successMessage}
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. buyer@farm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      paddingRight: '3rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#6B7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem',
                      borderRadius: '6px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1F2937')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(27,77,62,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.88rem', color: '#6B7280' }}>
                Don't have an account?{' '}
                <span
                  onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                  style={{ color: '#991B1B', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Create an account
                </span>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Role Toggle: Buyer vs Farmer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  I want to join as:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: role === 'buyer' ? '2px solid #1B4D3E' : '1px solid #D1D5DB',
                    backgroundColor: role === 'buyer' ? '#E8F5E9' : '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: role === 'buyer' ? '#1B4D3E' : '#4B5563'
                  }}>
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      checked={role === 'buyer'}
                      onChange={() => setRole('buyer')}
                      style={{ display: 'none' }}
                    />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingCart size={16} /> Buyer / Consumer
                    </span>
                  </label>

                  <label style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: role === 'farmer' ? '2px solid #1B4D3E' : '1px solid #D1D5DB',
                    backgroundColor: role === 'farmer' ? '#E8F5E9' : '#FFFFFF',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: role === 'farmer' ? '#1B4D3E' : '#4B5563'
                  }}>
                    <input
                      type="radio"
                      name="role"
                      value="farmer"
                      checked={role === 'farmer'}
                      onChange={() => setRole('farmer')}
                      style={{ display: 'none' }}
                    />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Tractor size={16} /> Farmer / Seller
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saurabh Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. saurabh@farm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {role === 'farmer' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                    Farm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saurabh Organic Farms"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Location Selectors */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Gujarat">Gujarat</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setCity(e.target.value); }}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Anand">Anand</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Password (≥ 8 chars)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      paddingRight: '3rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#6B7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem',
                      borderRadius: '6px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1F2937')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {password.length >= 8 && (
                  <div style={{ color: '#059669', fontSize: '0.78rem', marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Password length requirement met
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(27,77,62,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.88rem', color: '#6B7280' }}>
                Already have an account?{' '}
                <span
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
                  style={{ color: '#991B1B', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Sign in
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
