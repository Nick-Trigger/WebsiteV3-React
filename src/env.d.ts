/// <reference types="vite/client" />

// Python sources bundled as text (playground stdlib shims and examples).
declare module '*.py?raw' {
  const source: string;
  export default source;
}
