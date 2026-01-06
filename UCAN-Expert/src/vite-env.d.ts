// src/vite-env.d.ts
/// <reference types="vite/client" />

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}