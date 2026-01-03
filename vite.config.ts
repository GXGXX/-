import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize process.env (Vercel system vars) over .env file vars
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Vercel sets environment variables during build. 
      // We map process.env.API_KEY to the client-side bundle.
      // Using '|| ""' prevents undefined errors if the key is missing.
      'process.env.API_KEY': JSON.stringify(apiKey || "")
    }
  }
})