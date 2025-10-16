import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  MessageCircle, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react'

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chats' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar/Navigation */}
      <div className="hidden md:flex md:flex-col md:w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden lg:block">
            MyMessenger
          </h1>
          <div className="lg:hidden flex justify-center">
            <MessageCircle className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="ml-3 hidden lg:block">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="ml-3 hidden lg:block">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 hidden lg:block">Logout</span>
          </button>

          {/* User info */}
          <div className="flex items-center p-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=3b82f6&color=fff`}
              alt={user?.username}
              className="h-8 w-8 rounded-full"
            />
            <div className="ml-3 hidden lg:block">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            MyMessenger
          </h1>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-800 pt-20">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
              
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pt-0 pt-16">
        {children}
      </div>
    </div>
  )
}

export default Layout
