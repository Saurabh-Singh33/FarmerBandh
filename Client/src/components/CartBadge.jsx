import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartBadge = () => {
  const { user } = useAuth();
  const { uniqueItemsCount } = useCart();

  if (user && user.role?.toLowerCase() !== 'buyer') {
    return null;
  }

  return (
    <Link
      to="/cart"
      id="navbar-cart-btn"
      className="relative px-3.5 py-1.5 text-gray-800 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all rounded-full border border-gray-300 hover:border-emerald-500 flex items-center gap-2 shadow-2xs group shrink-0"
      style={{ textDecoration: 'none' }}
      title="View Shopping Cart"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart className="w-5 h-5 text-emerald-800 group-hover:scale-110 transition-transform" />
        {uniqueItemsCount > 0 && (
          <span className="absolute -top-2 -right-2.5 bg-emerald-700 text-white text-[10px] font-black px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {uniqueItemsCount > 99 ? '99+' : uniqueItemsCount}
          </span>
        )}
      </div>
      <span className="text-xs font-bold text-gray-800">
        Cart {uniqueItemsCount > 0 ? `(${uniqueItemsCount})` : ''}
      </span>
    </Link>
  );
};
export default CartBadge;
