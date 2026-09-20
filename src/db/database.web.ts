const DB_NAME = 'nothow_vault.db';

export const getDB = async (): Promise<any> => {
  return {
    execAsync: async () => {},
    runAsync: async (query: string, params: any[]) => {
      let items = JSON.parse(localStorage.getItem(DB_NAME) || '[]');
      if (query.includes('INSERT')) {
        items.push({ id: params[0], isDecoy: params[1], payload: params[2] });
      } else if (query.includes('UPDATE')) {
        items = items.map((i: any) => i.id === params[1] ? { ...i, payload: params[0] } : i);
      } else if (query.includes('DELETE')) {
        items = items.filter((i: any) => i.id !== params[0]);
      }
      localStorage.setItem(DB_NAME, JSON.stringify(items));
    },
    getAllAsync: async () => {
      return JSON.parse(localStorage.getItem(DB_NAME) || '[]');
    }
  };
};

export const initDB = async () => {
  return;
};

export const resetDB = async () => {
  localStorage.removeItem(DB_NAME);
  return;
};
