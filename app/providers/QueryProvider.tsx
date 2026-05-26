// providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient per session (not a module-level singleton)
  // so state isn't shared between different users / server requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus for this app — quotes are immutable
            refetchOnWindowFocus: false,
            // Show stale data immediately while refetching in background
            staleTime: 1000 * 60 * 5,
          },
          mutations: {
            // Surface errors to the nearest error boundary by default
            throwOnError: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
