declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Add CSS properties that TypeScript doesn't recognize by default
interface CSSProperties {
  [key: string]: any;
}