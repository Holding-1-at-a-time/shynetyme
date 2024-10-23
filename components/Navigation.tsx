'use client'

import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'

export function Navigation() {
  const { isSignedIn } = useAuth()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Auto Detail SaaS
        </Link>
        <div>
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="mr-4">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
