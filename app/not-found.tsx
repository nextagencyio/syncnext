'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="lg:my-40 flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The page may have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>

          <div className="text-sm text-muted-foreground">
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:text-primary/80 underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
