import { ReactElement } from 'react';

// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

export type UserProfile = {
  id?: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  image?: string;
  name?: string;
  roles?: string[];
  status?: string;
  tier?: string;
};

export interface AuthProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  token?: string | null;
}

export interface AuthActionProps {
  type: string;
  payload?: AuthProps;
}

export type JWTContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string, type: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  updateProfile: VoidFunction;
};
