import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Exclude tensorflow/mediapipe pose packages from pre-bundling to avoid
  // the Vite optimizer attempting to statically analyze Node-style exports
  // which cause the "Missing export Pose" error in dev.
  optimizeDeps: {
    exclude: ['@tensorflow-models/pose-detection', '@mediapipe/pose']
  }
})
