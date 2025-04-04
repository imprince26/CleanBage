import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'

const Layout = () => {
    const darkMode = useTheme();
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer darkMode={darkMode} />
    </>
  )
}

export default Layout
