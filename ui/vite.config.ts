import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Use automatic JSX runtime (React 17+)
            jsxRuntime: 'automatic',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        // Modern HMR setup
        hmr: {
            overlay: true,
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Modern build optimizations
        target: 'es2022',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'router': ['react-router-dom'],
                    'mui': ['@mui/material', '@mui/icons-material'],
                },
            },
        },
    },
    // Modern optimizations
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
    },
})
