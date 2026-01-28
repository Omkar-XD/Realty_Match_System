'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Phone, Mail, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const { login, loginWithPhone } = useAuth()
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    const success = login(email, password)
    if (!success) {
      setError('Invalid email or password')
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    
    setShowOtpInput(true)
  }

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    
    const success = loginWithPhone(phone, otp)
    if (!success) {
      setError('Invalid OTP or phone number not registered')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-2">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Realty Match</CardTitle>
          <CardDescription className="text-base">
            Sign in to manage your properties and buyers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full h-12 text-base font-medium">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={showOtpInput ? handlePhoneLogin : handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={showOtpInput}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="h-12 text-base text-center tracking-widest"
                  />
                  <p className="text-sm text-muted-foreground">
                    Demo OTP: 123456
                  </p>
                </div>
              )}
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full h-12 text-base font-medium">
                {showOtpInput ? 'Verify OTP' : 'Send OTP'}
              </Button>
              {showOtpInput && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowOtpInput(false)
                    setOtp('')
                    setError('')
                  }}
                  className="w-full h-12 text-base"
                >
                  Change Phone Number
                </Button>
              )}
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLoginMethod(loginMethod === 'email' ? 'phone' : 'email')
              setError('')
              setShowOtpInput(false)
              setOtp('')
            }}
            className="w-full h-12 text-base"
          >
            {loginMethod === 'email' ? (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Sign in with Phone
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Sign in with Email
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Demo Credentials:</p>
            <p>Admin: admin@realtymatch.com / admin123</p>
            <p>Staff: staff@realtymatch.com / staff123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
