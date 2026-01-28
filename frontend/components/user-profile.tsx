'use client'

import { useEffect } from "react"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import useIsMobile from '@/hooks/use-mobile'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Lock } from 'lucide-react'

// TypeScript Interfaces
interface UserData {
  name: string
  email: string
  phone: string
}

interface PasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

type ProfileMode = 'view' | 'edit' | 'password'

interface UserProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const { currentUser } = useAuth()
  const isMobile = useIsMobile()
  
  // State Management
  const [mode, setMode] = useState<ProfileMode>('view')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Edit Profile State - Initialize with empty strings to avoid currentUser dependency
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
  })

  // Password State
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Populate userData from currentUser only when modal opens (not on every render)
  useEffect(() => {
    if (open && currentUser) {
      setUserData({
        name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      })
    }
  }, [open, currentUser]) // Removed currentUser?.id to avoid specifying a dependency more specific than its captures

  // Helper Functions
  const clearMessages = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Mode Handlers
  const handleEditProfile = () => {
    clearMessages()
    setMode('edit')
  }

  const handleChangePassword = () => {
    clearMessages()
    setMode('password')
  }

  const handleCancelEdit = () => {
    clearMessages()
    setUserData({
      name: currentUser?.full_name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    })
    setMode('view')
  }

  const handleCancelPassword = () => {
    clearMessages()
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setMode('view')
  }

  // Form Handlers
  const handleUserDataChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    clearMessages()

    // Validation
    if (!userData.name.trim()) {
      setErrorMessage('Name is required')
      return
    }
    if (!userData.email.trim()) {
      setErrorMessage('Email is required')
      return
    }
    if (!userData.phone.trim()) {
      setErrorMessage('Phone is required')
      return
    }

    setIsLoading(true)

    try {
      // TODO: API integration - Replace with actual API call
      // Example: await updateUserProfile(userData)
      console.log('[UserProfile] Saving profile data:', userData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSuccessMessage('Profile updated successfully')
      setTimeout(() => {
        setMode('view')
        clearMessages()
      }, 1500)
    } catch (error) {
      setErrorMessage('Failed to update profile')
      console.error('[UserProfile] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePassword = async () => {
    clearMessages()

    // Validation
    if (!passwordData.oldPassword) {
      setErrorMessage('Old password is required')
      return
    }
    if (!passwordData.newPassword) {
      setErrorMessage('New password is required')
      return
    }
    if (!passwordData.confirmPassword) {
      setErrorMessage('Confirm password is required')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      // TODO: API integration - Replace with actual API call
      // Example: await changeUserPassword(passwordData)
      console.log('[UserProfile] Changing password (old password validation skipped in frontend)')

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSuccessMessage('Password changed successfully')
      setTimeout(() => {
        setMode('view')
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        clearMessages()
      }, 1500)
    } catch (error) {
      setErrorMessage('Failed to change password')
      console.error('[UserProfile] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordMismatch =
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordData.newPassword !== passwordData.confirmPassword

  // Modal Content Component - Memoized to prevent remounting on every render
  const ModalContent = React.useMemo(() => () => (
    <>
      {mode === 'view' && (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(currentUser?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{currentUser?.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{currentUser?.role}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
              <p className="text-base mt-1">{currentUser?.email}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
              <p className="text-base mt-1">{currentUser?.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="default"
              className="h-12 w-full"
              onClick={handleEditProfile}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full bg-transparent"
              onClick={handleChangePassword}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-input" className="text-sm font-semibold">
              Name
            </Label>
            <Input
              id="name-input"
              type="text"
              value={userData.name}
              onChange={(e) => handleUserDataChange('name', e.target.value)}
              placeholder="Enter your name"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-input" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email-input"
              type="email"
              value={userData.email}
              onChange={(e) => handleUserDataChange('email', e.target.value)}
              placeholder="Enter your email"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-input" className="text-sm font-semibold">
              Phone
            </Label>
            <Input
              id="phone-input"
              type="tel"
              value={userData.phone}
              onChange={(e) => handleUserDataChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="h-12 text-base"
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 text-sm">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              className="h-12 w-full"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full bg-transparent"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === 'password' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword-input" className="text-sm font-semibold">
              Old Password
            </Label>
            <Input
              id="oldPassword-input"
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
              placeholder="Enter your old password"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword-input" className="text-sm font-semibold">
              New Password
            </Label>
            <Input
              id="newPassword-input"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Enter your new password"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword-input" className="text-sm font-semibold">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword-input"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
              className={`h-12 text-base ${
                isPasswordMismatch ? 'border-destructive focus:ring-destructive' : ''
              }`}
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 text-sm">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              className="h-12 w-full"
              onClick={handleSavePassword}
              disabled={isLoading || isPasswordMismatch}
            >
              {isLoading ? 'Saving...' : 'Save Password'}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full bg-transparent"
              onClick={handleCancelPassword}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  ), [mode, userData, passwordData, currentUser, isPasswordMismatch, successMessage, errorMessage])

  // Return Dialog for desktop, Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{mode === 'view' ? 'Profile' : mode === 'edit' ? 'Edit Profile' : 'Change Password'}</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <div className="px-4 pb-6">
            {ModalContent()}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'view' ? 'Profile' : mode === 'edit' ? 'Edit Profile' : 'Change Password'}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        {ModalContent()}
      </DialogContent>
    </Dialog>
  )
}
