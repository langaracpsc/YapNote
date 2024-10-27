import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import fs from 'fs'

// Function to copy WASM files
function copyWasmFiles() {
  const wasmFiles = [
    'ort-wasm.wasm',
    'ort-wasm-simd.wasm',
    'ort-wasm-threaded.wasm'
  ];

  wasmFiles.forEach(file => {
    try {
      const srcPath = path.resolve(__dirname, `node_modules/.pnpm/onnxruntime-web@1.14.0/node_modules/onnxruntime-web/dist/${file}`);
      const destPath = path.resolve(__dirname, `public/${file}`);
      
      // Create public directory if it doesn't exist
      if (!fs.existsSync('public')) {
        fs.mkdirSync('public', { recursive: true });
      }

      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file} to public directory`);
    } catch (err) {
      console.warn(`Warning: Could not copy ${file}:`, err);
    }
  });
}

// Call it immediately
copyWasmFiles();



export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    exclude: ['@xenova/transformers']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  }
})
