import React, { useState } from 'react';
import { NavigationContext } from './NavigationContext.js';

export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login' | 'register'

  const navigate = (page, targetSectionId = null) => {
    setCurrentPage(page);
    if (page === 'home' && targetSectionId) {
      setTimeout(() => {
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const value = {
    currentPage,
    setCurrentPage,
    navigate,
    isHome: currentPage === 'home',
    isLogin: currentPage === 'login',
    isRegister: currentPage === 'register'
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
