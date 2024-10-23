import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export default async function Home() {
  const { userId } = await useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Auto Detail SaaS</h1>
      {userId ? (
        <div className="space-y-4">
          <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center">
            Go to Dashboard
          </Link>
          <Link href="/self-assessment" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block text-center">
            Start Self-Assessment
          </Link>
        </div>
      ) : (
        <Link href="/sign-in" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </Link>
      )}
    </main>
  )
}
