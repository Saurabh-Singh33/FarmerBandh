import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  Menu,
  X,
  ShoppingBag,
  Handshake,
  Bookmark,
  Store,
  Package,
  Wallet,
  Tractor,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Sliders,
  LogOut,
  ChevronDown,
  Globe,
  User,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNegotiation } from '../context/NegotiationContext';
import { useLanguage } from '../context/LanguageContext';
import { CartBadge } from './CartBadge';
import { NotificationBell } from './NotificationBell';

const DropdownItem = ({ to, onClick, icon: Icon, label, badge, badgeBg = '#F1F5F9', badgeColor = '#475569', isDanger = false, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.55rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.84rem',
        fontWeight: 500,
        color: isDanger ? (hovered ? '#B91C1C' : '#DC2626') : (hovered ? '#0F172A' : '#334155'),
        backgroundColor: isDanger ? (hovered ? '#FEF2F2' : 'transparent') : (hovered ? '#F1F5F9' : 'transparent'),
        transition: 'all 0.15s ease',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon
          size={16}
          color={isDanger ? '#DC2626' : (hovered ? '#1B4D3E' : '#64748B')}
          strokeWidth={1.9}
        />
        <span>{label}</span>
      </div>
      {badge && (
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          padding: '1px 7px',
          borderRadius: '9999px',
          backgroundColor: badgeBg,
          color: badgeColor
        }}>
          {badge}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onSelect} style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} style={{ width: '100%' }}>
      {content}
    </div>
  );
};

const LanguageNavButton = () => {
  const { currentLanguage, openInitialPrompt } = useLanguage();
  const label = currentLanguage === 'hi' ? 'हिन्दी' : currentLanguage === 'gu' ? 'ગુજરાતી' : 'English';
  return (
    <button
      type="button"
      onClick={openInitialPrompt}
      title="Change language / भाषा बदलें"
      className="notranslate"
      translate="no"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.38rem 0.7rem',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        color: '#334155',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F8FAFC';
        e.currentTarget.style.borderColor = '#10B981';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = '#E2E8F0';
      }}
    >
      <Globe size={14} color="#059669" />
      <span>{label}</span>
    </button>
  );
};

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
      { label: 'Mandi Rates', path: '/mandi-prices', badge: 'Live' },
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
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#1B4D3E',
                letterSpacing: '-0.025em',
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
                    transition: 'color 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {link.label}
                  {link.badge && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0'
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
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

          {/* Desktop Right: Language switcher & Sign in pill button */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <LanguageNavButton />
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
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <LanguageNavButton />
                </div>
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
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#1B4D3E',
            letterSpacing: '-0.025em'
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
        <Link
          to="/mandi-prices"
          style={{
            textDecoration: 'none',
            color: '#065F46',
            fontSize: '0.86rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            padding: '3px 10px',
            borderRadius: '9999px',
            border: '1px solid #A7F3D0'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block'
            }}
          />
          Mandi Rates
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
            <Link to="/seller/profile" style={{ textDecoration: 'none', color: '#16A34A', fontSize: '0.92rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Profile
            </Link>
          </>
        )}
        {user?.role?.toLowerCase() === 'admin' && (
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#374151', fontSize: '0.92rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Admin Portal
          </Link>
        )}
      </div>

      {/* Right Controls: Language, Cart, Bell & Profile (ALWAYS PINNED AND VISIBLE) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
        <LanguageNavButton />
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px 3px 4px',
                borderRadius: '9999px',
                backgroundColor: dropdownOpen ? '#E8F5E9' : '#FFFFFF',
                border: `1px solid ${dropdownOpen ? '#86EFAC' : '#E2E8F0'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
              title={user.fullName}
              aria-label="User profile menu"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1B4D3E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(user.fullName)
                )}
              </div>
              <ChevronDown
                size={14}
                color="#475569"
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {dropdownOpen && (() => {
              const role = (user?.role || '').toLowerCase();
              const roleConfig = role === 'farmer'
                ? { label: 'Farmer Partner', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', Icon: Tractor }
                : role === 'admin'
                ? { label: 'Platform Admin', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', Icon: ShieldAlert }
                : { label: 'Verified Buyer', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', Icon: ShieldCheck };
              const RoleIcon = roleConfig.Icon;
              const profileLink = role === 'farmer' ? '/seller/profile' : role === 'admin' ? '/admin/profile' : '/profile';

              return (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '260px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
                    zIndex: 110,
                    overflow: 'hidden'
                  }}
                >
                  {/* User Identity Header Card - Clickable to open Profile */}
                  <Link
                    to={profileLink}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      padding: '0.9rem 1rem',
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EEF2F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#1B4D3E',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(27,77,62,0.2)',
                        overflow: 'hidden'
                      }}
                    >
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.fullName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0F172A',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {user.fullName}
                      </div>
                      <div
                        style={{
                          color: '#64748B',
                          fontSize: '0.76rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {user.email}
                      </div>
                      <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '1px 7px',
                            borderRadius: '9999px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: roleConfig.bg,
                            color: roleConfig.color,
                            border: `1px solid ${roleConfig.border}`
                          }}
                        >
                          <RoleIcon size={11} strokeWidth={2.2} /> {roleConfig.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#1B4D3E', fontWeight: 600 }}>
                          View Profile →
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Menu Items Container */}
                  <div style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {/* Buyer Navigation */}
                    {role === 'buyer' && (
                      <>
                        <DropdownItem
                          to="/profile"
                          icon={User}
                          label="Profile"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/orders"
                          icon={ShoppingBag}
                          label="My Orders"
                          badge="Track"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/negotiations"
                          icon={Handshake}
                          label="Price Negotiations"
                          badge={unreadCount > 0 ? `${unreadCount} new` : null}
                          badgeBg="#DCFCE7"
                          badgeColor="#15803D"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/saved-farmers"
                          icon={Bookmark}
                          label="Saved Farmers"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/marketplace"
                          icon={Store}
                          label="Explore Marketplace"
                          onSelect={() => setDropdownOpen(false)}
                        />
                      </>
                    )}

                    {/* Farmer Navigation */}
                    {role === 'farmer' && (
                      <>
                        <DropdownItem
                          to="/seller/profile"
                          icon={User}
                          label="My Farm Profile"
                          badge="Edit Gmail & Phone"
                          badgeBg="#DCFCE7"
                          badgeColor="#15803D"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/seller/dashboard"
                          icon={Store}
                          label="Seller Dashboard"
                          badge="Hub"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/seller/listings"
                          icon={Package}
                          label="My Crop Listings"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/seller/orders"
                          icon={ShoppingBag}
                          label="Orders Received"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/seller/negotiations"
                          icon={Handshake}
                          label="Buyer Negotiations"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/seller/payouts"
                          icon={Wallet}
                          label="Earnings & Payouts"
                          onSelect={() => setDropdownOpen(false)}
                        />
                      </>
                    )}

                    {/* Admin Navigation */}
                    {role === 'admin' && (
                      <>
                        <DropdownItem
                          to="/admin/dashboard"
                          icon={ShieldCheck}
                          label="Admin Dashboard"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/admin/farmers"
                          icon={Tractor}
                          label="Farmer Directory"
                          badge="Verify"
                          badgeBg="#FEF3C7"
                          badgeColor="#B45309"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/admin/listings"
                          icon={Package}
                          label="Manage Listings"
                          onSelect={() => setDropdownOpen(false)}
                        />
                        <DropdownItem
                          to="/admin/orders"
                          icon={ShoppingBag}
                          label="Platform Orders"
                          onSelect={() => setDropdownOpen(false)}
                        />
                      </>
                    )}

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 6px' }} />

                    {/* Shared Utilities */}
                    <DropdownItem
                      to="/notifications"
                      icon={Bell}
                      label="Notifications"
                      onSelect={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      to="/notifications/preferences"
                      icon={Sliders}
                      label="Preferences"
                      onSelect={() => setDropdownOpen(false)}
                    />

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 6px' }} />

                    {/* Sign Out */}
                    <DropdownItem
                      onClick={handleLogout}
                      icon={LogOut}
                      label="Sign Out"
                      isDanger={true}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </nav>
  );
};
