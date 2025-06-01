import { createRouter as createTanstackRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'

// Create a new router instance
export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Use defaultPendingComponent to show a loading state during navigation
    defaultPendingComponent: () => (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    ),
    // Add default context to avoid hydration mismatches
    context: {
      isClient: typeof window !== 'undefined',
    }
  })

  return router
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
