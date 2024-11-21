export const authStorage = {
  prefix: 'auth_' as const,
  
  setItem(key: string, value: any): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  },

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
};

