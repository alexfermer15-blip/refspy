// Mock supabase exports for development
// Replace with actual Supabase implementation

export const usersAPI = {
  getUsers: async () => {
    return [];
  },
  getUser: async (id: string) => {
    return null;
  },
  createUser: async (userData: any) => {
    return userData;
  },
  updateUser: async (id: string, userData: any) => {
    return userData;
  },
  deleteUser: async (id: string) => {
    return true;
  },
};

export const activityLogsAPI = {
  getLogs: async () => {
    return [];
  },
  createLog: async (logData: any) => {
    return logData;
  },
  getLogsByUser: async (userId: string) => {
    return [];
  },
};

export const paymentsAPI = {
  getPayments: async () => {
    return [];
  },
  getPaymentsByUser: async (userId: string) => {
    return [];
  },
  createPayment: async (paymentData: any) => {
    return paymentData;
  },
  updatePayment: async (id: string, paymentData: any) => {
    return paymentData;
  },
  processPayment: async (paymentId: string) => {
    return { status: 'processed' };
  },
};

export const competitorsAPI = {
  getCompetitors: async () => {
    return [];
  },
  getCompetitor: async (id: string) => {
    return null;
  },
};

export const supabase = {
  auth: {
    signUp: async (credentials: any) => ({ user: null, error: null }),
    signIn: async (credentials: any) => ({ user: null, error: null }),
    signOut: async () => ({ error: null }),
  },
};
