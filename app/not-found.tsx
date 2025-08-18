// app/not-found.tsx

import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p>Could not find requested resource</p>
      <Link className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"href="/">Go Home</Link>
    </div>
  )
}
