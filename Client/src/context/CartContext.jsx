import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user || user.role?.toLowerCase() !== 'buyer') {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantityQuintal, negotiatedUnitPrice = null) => {
    setLoading(true);
    try {
      const updatedCart = await cartApi.addItem(productId, quantityQuintal, negotiatedUnitPrice);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantityQuintal) => {
    setLoading(true);
    try {
      const updatedCart = await cartApi.updateItem(itemId, quantityQuintal);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update item';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
      notify.info('Item removed from cart.');
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      setError(msg);
      notify.error(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    setLoading(true);
    try {
      const updatedCart = await cartApi.applyCoupon(code);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply coupon';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    setLoading(true);
    try {
      const updatedCart = await cartApi.removeCoupon();
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove coupon';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await cartApi.clearCart();
      setCart({
        id: null,
        couponCode: null,
        subtotal: 0,
        bulkDiscountTotal: 0,
        couponDiscountTotal: 0,
        deliveryFee: 0,
        platformFee: 0,
        taxAmount: 0,
        totalAmount: 0,
        items: []
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items ? cart.items.reduce((sum, item) => sum + (item.quantityQuintal || 0), 0) : 0;
  const uniqueItemsCount = cart?.items?.length || 0;

  const value = {
    cart,
    loading,
    error,
    itemCount,
    uniqueItemsCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
