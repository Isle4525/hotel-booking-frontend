import React, { useState, useEffect, useMemo } from 'react';
import { CartContext } from './CartContext.js';
import { getActiveDiscount, getFinalPrice } from '../utils/pricing.js';

const CART_STORAGE_KEY = 'booker_cart_items';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse cart items from localStorage', err);
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // 1. Загрузка и сохранение данных — useEffect + localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart items to localStorage', err);
    }
  }, [cartItems]);

  useEffect(() => {
    const nearestEnd = cartItems.reduce((nearest, item) => {
      const discount = getActiveDiscount(item.hotel, now);
      const end = discount ? new Date(discount.endsAt).getTime() : Infinity;
      return Math.min(nearest, end);
    }, Infinity);
    if (!Number.isFinite(nearestEnd)) return undefined;
    const delay = Math.min(2 ** 31 - 1, Math.max(0, nearestEnd - now + 50));
    const timeout = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timeout);
  }, [cartItems, now]);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const toggleCart = () => setCartOpen((prev) => !prev);

  const addToCart = (hotel) => {
    setCartItems((items) => {
      if (items.some((item) => item.hotel.id === hotel.id)) {
        return items;
      }
      return [...items, { hotel, roomsCount: 1, nights: 1, selected: true }];
    });
  };

  const updateCartItem = (hotelId, changes) => {
    setCartItems((items) =>
      items.map((item) =>
        item.hotel.id === hotelId ? { ...item, ...changes } : item
      )
    );
  };

  const removeCartItem = (hotelId) => {
    setCartItems((items) => items.filter((item) => item.hotel.id !== hotelId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getInCartCount = (hotelId) => {
    const item = cartItems.find((it) => it.hotel.id === hotelId);
    return item ? item.roomsCount || 0 : 0;
  };

  const activeItems = useMemo(
    () => cartItems.filter((it) => it.selected !== false),
    [cartItems]
  );

  const totalRooms = useMemo(
    () => activeItems.reduce((sum, it) => sum + (it.roomsCount || 1), 0),
    [activeItems]
  );

  const totalPrice = useMemo(
    () =>
      activeItems.reduce(
        (sum, it) => sum + getFinalPrice(it.hotel, now) * (it.roomsCount || 1) * (it.nights || 1),
        0
      ),
    [activeItems, now]
  );

  const value = {
    cartItems,
    cartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getInCartCount,
    cartCount: cartItems.length,
    activeItems,
    totalRooms,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
