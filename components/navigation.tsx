"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsAuthenticated, useCurrentUser, useAuthActions } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"

// User Dropdown Component
function UserDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { logout } = useAuthActions()
  const { toast } = useToast()
  const router = useRouter()
  const currentUser = useCurrentUser()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        type: 'success',
        title: '👋 Logged Out',
        description: 'You have been successfully logged out.',
        duration: 3000
      })
      router.push('/')
    } catch (error) {
      toast({
        type: 'error',
        title: '❌ Logout Failed',
        description: 'There was an error logging out. Please try again.',
        duration: 5000
      })
    }
    setIsDropdownOpen(false)
  }

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    if (user?.email) {
      return user.email
    }
    return 'User'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentUser?.profileImageUrl ? (
          <Image
            src={currentUser.profileImageUrl}
            alt={getUserDisplayName(currentUser)}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getUserInitials(currentUser)}
            </span>
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {getUserDisplayName(currentUser)}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </Button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName(currentUser)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email}
              </p>
            </div>
            
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Link>
              <Link
                href="/my-proposals"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <UserCircle className="h-4 w-4 mr-3" />
                My Proposals
              </Link>
            </div>
            
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const isAuthenticated = useIsAuthenticated()
  const currentUser = useCurrentUser()
  const { logout } = useAuthActions()
  const { toast } = useToast()
  const router = useRouter()

  const handleMobileLogout = async () => {
    try {
      await logout()
      toast({
        type: 'success',
        title: '👋 Logged Out',
        description: 'You have been successfully logged out.',
        duration: 3000
      })
      router.push('/')
      setIsOpen(false)
    } catch (error) {
      toast({
        type: 'error',
        title: '❌ Logout Failed',
        description: 'There was an error logging out. Please try again.',
        duration: 5000
      })
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Deyor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.firstName && currentUser?.lastName 
                          ? `${currentUser.firstName} ${currentUser.lastName}`
                          : currentUser?.firstName || currentUser?.email || 'User'
                        }
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      href="/my-proposals"
                      className="block px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      My Proposals
                    </Link>
                    <button
                      onClick={handleMobileLogout}
                      className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/signin" onClick={() => setIsOpen(false)}>Sign In</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
