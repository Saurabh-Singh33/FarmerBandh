import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNegotiation } from '../context/NegotiationContext';
import { CartBadge } from './CartBadge';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNegotiation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/auth');
  };

  const getProfileLink = () => {
    if (!user) return '/auth';
    const r = (user.role || '').toLowerCase();
    if (r === 'farmer') return '/seller/dashboard';
    if (r === 'admin') return '/admin/dashboard';
    return '/marketplace';
  };

  // Dedicated Guest Header for unauthenticated visitors
  if (!user) {
    const guestNavLinks = [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Help', path: '/help' },
      { label: 'Contact', path: '/contact' }
    ];

    return (
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo on Left */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#1B4D3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(27,77,62,0.2)'
            }}>
              <Sprout size={20} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <div>
              <span style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#1B4D3E',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                display: 'block'
              }}>
                FarmerBandh
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#6B7280', marginTop: '1px' }}>
                Direct Local Produce
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2.2rem' }}>
            {guestNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.94rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#1B4D3E' : '#4B5563',
                    position: 'relative',
                    padding: '0.4rem 0',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      backgroundColor: '#1B4D3E',
                      borderRadius: '2px'
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right: Sign in pill button */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/auth"
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                padding: '0.55rem 1.4rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(27,77,62,0.18)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Sign in
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.4rem',
              color: '#1B4D3E',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            padding: '1rem 1.5rem 1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {guestNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      textDecoration: 'none',
                      fontSize: '0.98rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#1B4D3E' : '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#E8F5E9' : 'transparent'
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #F3F4F6' }}>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: '#1B4D3E',
                    color: '#FFFFFF',
                    padding: '0.65rem 1rem',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.92rem'
                  }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo & Title */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#1B4D3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(27,77,62,0.2)'
        }}>
          <Sprout size={20} color="#FFFFFF" strokeWidth={2.2} />
        </div>
        <div>
          <span style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#1B4D3E',
            letterSpacing: '-0.02em'
          }}>
            FarmerBandh
          </span>
          <span style={{ display: 'block', fontSize: '0.72rem', color: '#6B7280', marginTop: '-4px' }}>
            Direct Local Produce
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', overflowX: 'auto', padding: '0.2rem 0.5rem', scrollbarWidth: 'none' }}>
        <Link to="/marketplace" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Marketplace
        </Link>
        {(!user || user?.role?.toLowerCase() === 'buyer') && (
          <>
            <Link to="/orders" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              My Orders
            </Link>
            {user && (
              <>
                <Link to="/negotiations" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap', position: 'relative' }}>
                  Negotiations
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-16px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      minWidth: '16px',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/saved-farmers" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Saved Farmers
                </Link>
                <Link to="/returns" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Returns
                </Link>
                <Link to="/disputes" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Disputes
                </Link>
              </>
            )}
          </>
        )}
        {user?.role?.toLowerCase() === 'farmer' && (
          <>
            <Link to="/seller/dashboard" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Seller Hub
            </Link>
            <Link to="/seller/listings" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              My Listings
            </Link>
            <Link to="/seller/orders" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Orders Queue
            </Link>
            <Link to="/seller/payouts" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Payouts
            </Link>
            <Link to="/seller/returns" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Returns
            </Link>
            <Link to="/seller/disputes" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Disputes
            </Link>
          </>
        )}
        {user?.role?.toLowerCase() === 'admin' && (
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Admin Portal
          </Link>
        )}
      </div>

      {/* Right Controls: Cart, Bell & Profile (ALWAYS PINNED AND VISIBLE) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexShrink: 0, marginLeft: '1rem' }}>
        <CartBadge />
        {user && <NotificationBell />}

        {/* User Auth Section */}
        {!user ? (
          <Link
            to="/auth"
            style={{
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              padding: '0.55rem 1.3rem',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(27,77,62,0.15)',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            Sign in
          </Link>
        ) : (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: '2px solid #E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                flexShrink: 0
              }}
              title={user.fullName}
            >
              {getInitials(user.fullName)}
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '240px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                padding: '1rem',
                zIndex: 110
              }}>
                <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.fullName}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'inline-block',
                    padding: '0.15rem 0.6rem',
                    backgroundColor: '#E8F5E9',
                    color: '#1B4D3E',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </div>
                </div>

                <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(!user || user?.role?.toLowerCase() === 'buyer') && (
                    <Link
                      to="/cart"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        textDecoration: 'none',
                        color: '#15803D',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        backgroundColor: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #A7F3D0'
                      }}
                    >
                      <span>🛒 View Shopping Cart</span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#15803D', color: '#fff', borderRadius: '9999px', padding: '1px 6px' }}>Go →</span>
                    </Link>
                  )}

                  <Link
                    to={getProfileLink()}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      display: 'block'
                    }}
                  >
                    Profile & Dashboard
                  </Link>

                  <Link
                    to="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>All alerts</span>
                  </Link>

                  <Link
                    to="/notifications/preferences"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      display: 'block'
                    }}
                  >
                    Preferences
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
