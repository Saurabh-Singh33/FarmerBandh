import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home, ShoppingBag, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          padding: '3rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03)'
        }}
      >
        {/* Brand Icon Circle */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ECFDF5',
            border: '2px solid #A7F3D0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 6px -1px rgba(5,150,105,0.1)'
          }}
        >
          <Sprout size={40} strokeWidth={2.2} />
        </div>

        {/* 404 Badge */}
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            fontSize: '0.82rem',
            fontWeight: 700,
            padding: '3px 12px',
            borderRadius: '9999px',
            marginBottom: '0.75rem',
            letterSpacing: '0.05em'
          }}
        >
          404 ERROR
        </span>

        <h1
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1B4D3E',
            margin: '0 0 0.75rem 0',
            letterSpacing: '-0.02em'
          }}
        >
          This Plot is Empty
        </h1>

        <p
          style={{
            color: '#6B7280',
            fontSize: '0.96rem',
            lineHeight: '1.6',
            margin: '0 auto 2rem',
            maxWidth: '420px'
          }}
        >
          The page or produce you're looking for might have been moved, harvested, or never existed in the first place.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              padding: '0.7rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(27,77,62,0.2)'
            }}
          >
            <Home size={16} /> Back to Home
          </Link>

          <Link
            to="/marketplace"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              padding: '0.7rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #D1D5DB'
            }}
          >
            <ShoppingBag size={16} /> Browse Produce
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
