import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for assets to work correctly on Vercel
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // This will open the browser automatically
    proxy: {
      // Ensure API routes are handled by Vite's internal server for Vercel functions
      // and not proxied elsewhere during development.
      // Remove any conflicting proxy rules for /api if they existed elsewhere.
      // This empty target effectively disables proxying for /api.
      '/api': {}
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure build outputs files in a Vercel-compatible format
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Ensure CSS doesn't cause MIME type issues
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'process.env.VITE_HELICONE_API_KEY': JSON.stringify(process.env.VITE_HELICONE_API_KEY),
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygvvrtiljpnbrzxkxaco.supabase.co'),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndnZydGlsanBuYnJ6eGt4YWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTI3MjAsImV4cCI6MjA0NzgyODcyMH0.bKH3xesGXWulHGHpJWXCL3yo3gZxe75yJcR2w4uQ5SE'),
    'process.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY || 'sk-dummy-key'),
  },
})