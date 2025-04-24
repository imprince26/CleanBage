import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { Icons } from '@/components/Icons'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const { handleGoogleCallback } = useAuth()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        if (!code) {
          throw new Error('No authorization code found')
        }

        // Process the callback
        await handleGoogleCallback(code)
        setStatus('success')
        toast.success('Successfully logged in with Google')
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)

      } catch (error) {
        console.error('Google auth error:', error)
        setStatus('error')
        toast.error('Failed to authenticate with Google')
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    }

    processCallback()
  }, [navigate, handleGoogleCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 space-y-4">
        {status === 'processing' && (
          <div className="text-center space-y-4">
            <Icons.spinner className="h-8 w-8 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-semibold">Processing</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your Google sign-in...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <Icons.check className="h-8 w-8 mx-auto text-green-500" />
            <h2 className="text-2xl font-semibold text-green-500">
              Authentication Successful
            </h2>
            <p className="text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <Icons.x className="h-8 w-8 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold text-destructive">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground">
              There was a problem signing you in with Google. 
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}