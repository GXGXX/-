import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Vercel sets environment variables during build. 
      // We map process.env.API_KEY to the client-side bundle.
      // WARNING: This exposes the API key to the browser. 
      // For a personal PWA/Demo this is acceptable, but be aware of the security implication.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})