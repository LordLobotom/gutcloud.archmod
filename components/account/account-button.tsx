'use client'

import { useState } from 'react'
import { User, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuthMode } from '@/lib/config'

interface AccountButtonProps {
  authMode: AuthMode
  userEmail: string | null
  onSignIn: () => void
  onSignOut: () => void
}

export function AccountButton({ authMode, userEmail, onSignIn, onSignOut }: AccountButtonProps) {
  const [open, setOpen] = useState(false)

  const handleSignIn = () => {
    setOpen(false)
    onSignIn()
  }

  const handleSignOut = () => {
    setOpen(false)
    onSignOut()
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(prev => !prev)}>
        <User className="w-4 h-4 mr-2" />
        Account
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-50 p-2 space-y-2">
          {authMode === 'disabled' && (
            <div className="text-xs text-muted-foreground px-2 py-1">
              Auth disabled (MVP mode)
            </div>
          )}
          {authMode !== 'disabled' && userEmail && (
            <div className="px-2 py-1">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm text-foreground truncate">{userEmail}</p>
            </div>
          )}
          {authMode !== 'disabled' && !userEmail && (
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignIn}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
          )}
          {authMode !== 'disabled' && userEmail && (
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
