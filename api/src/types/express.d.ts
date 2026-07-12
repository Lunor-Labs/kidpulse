export interface AuthUser {
  id: string;
  email: string | null;
  fullName?: string | null;
  role: 'customer' | 'staff' | 'super_admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
