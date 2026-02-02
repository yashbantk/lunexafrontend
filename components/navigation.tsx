"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, UserCircle, ChevronDown, PlusCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsAuthenticated, useCurrentUser, useAuthActions } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"

// User Dropdown Component
function UserDropdown() {
  const { logout } = useAuthActions()
  const { toast } = useToast()
  const router = useRouter()
  const currentUser = useCurrentUser()

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 px-2 hover:bg-gray-100 data-[state=open]:bg-gray-100 outline-none ring-0 focus-visible:ring-0 transition-colors duration-200"
        >
          <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            {currentUser?.profileImageUrl ? (
              <Image
                src={currentUser.profileImageUrl}
                alt={getUserDisplayName(currentUser)}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">
                  {getUserInitials(currentUser)}
                </span>
              </div>
            )}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {getUserDisplayName(currentUser)}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getUserDisplayName(currentUser)}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{currentUser?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/proposal" className="w-full cursor-pointer text-primary focus:text-primary font-medium">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Create Proposal</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-proposals" className="w-full cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>My Proposals</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
            <img 
              src="/assets/brandlogo/images.webp" 
              alt="Deyor Logo" 
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Deyor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
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
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
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
                      href="/proposal"
                      className="flex items-center px-3 py-2 text-primary font-medium hover:bg-primary/5 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Proposal
                    </Link>
                    <Link
                      href="/my-proposals"
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      My Proposals
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleMobileLogout}
                      className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
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
