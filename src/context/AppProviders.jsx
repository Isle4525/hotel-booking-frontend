import React from 'react';
import { ThemeProvider } from './ThemeProvider.jsx';
import { AuthProvider } from './AuthProvider.jsx';
import { NavigationProvider } from './NavigationProvider.jsx';
import { CartProvider } from './CartProvider.jsx';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
