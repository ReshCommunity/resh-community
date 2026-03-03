declare global {
  interface Window {
    CMS: {
      init: (config?: any) => void;
    };
  }
}

export {};
