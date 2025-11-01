// Supabase API mock exports
// These are placeholder implementations

export const usersAPI = {
  getUsers: async () => [],
  getUser: async (id: string) => null,
  createUser: async (userData: any) => userData,
  updateUser: async (id: string, userData: any) => userData,
  deleteUser: async (id: string) => true,
};

export const activityLogsAPI = {
  getLogs: async () => [],
  createLog: async (logData: any) => logData,
  getLogsByUser: async (userId: string) => [],
};

export const paymentsAPI = {
  getPayments: async () => [],
  getPaymentsByUser: async (userId: string) => [],
  createPayment: async (paymentData: any) => paymentData,
  updatePayment: async (id: string, paymentData: any) => paymentData,
  processPayment: async (paymentId: string) => ({ status: 'processed' }),
};

export const settingsAPI = {
  getSettings: async () => ({}),
  updateSettings: async (settings: any) => settings,
  getSetting: async (key: string) => null,
};

export const competitorsAPI = {
  getCompetitors: async () => [],
  getCompetitor: async (id: string) => null,
  createCompetitor: async (data: any) => data,
  updateCompetitor: async (id: string, data: any) => data,
  deleteCompetitor: async (id: string) => true,
};

export const authContextAPI = {
  signIn: async (email: string, password: string) => null,
  signUp: async (email: string, password: string) => null,
  signOut: async () => null,
};

export const supabase = {
  auth: {
    signUp: async (credentials: any) => ({ user: null, error: null }),
    signIn: async (credentials: any) => ({ user: null, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => null,
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: (data: any) => ({ data, error: null }),
    update: (data: any) => ({ data, error: null }),
    delete: () => ({ error: null }),
  }),
};

export default supabase;
