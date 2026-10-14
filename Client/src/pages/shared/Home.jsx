import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ backgroundColor: '#F9FBF8', minHeight: '80vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', color: '#1B4D3E', marginBottom: '1rem', lineHeight: 1.1 }}>
          Trade directly. Grow together.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4B5563', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          FarmerBandh empowers local farmers to connect directly with regional buyers in Gujarat and across India. Zero middleman fees, transparent pricing.
        </p>

        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link
              to="/auth"
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(27,77,62,0.2)'
              }}
            >
              Get Started — Sign in / Register
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link
              to={user.role === 'farmer' ? '/seller/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/marketplace'}
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFF',
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(27,77,62,0.2)'
              }}
            >
              Go to Your Dashboard ({user.fullName})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
