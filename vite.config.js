import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	sourcemap: true,
	base: process.env.NODE_ENV === 'production' ? '/' : '/',  
	publicDir: 'public', 
	test: {
		environment: 'jsdom',
		setupFiles: './src/test/setup.js'
	}
})
