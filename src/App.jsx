import React from 'react'
import { AppProviders, useNavigation } from './context'
import BookingCart from './components/BookingCart.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import HotelList from './components/HotelList.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Services from './components/Services.jsx'

function MainContent() {
  const { currentPage } = useNavigation()

  return (
    <>
      <Header />
      <main>
        {currentPage === 'login' && <Login />}
        {currentPage === 'register' && <Register />}
        {currentPage === 'home' && (
          <>
            <Hero />
            <HotelList />
            <Services />
          </>
        )}
      </main>
      <Footer />
      <BookingCart />
    </>
  )
}

export default function App() {
  return (
    <AppProviders>
      <MainContent />
    </AppProviders>
  )
}


