/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  // 在这里可以添加其他环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}