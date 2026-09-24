import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios, { redirectWithBasePath } from 'utils/axios';

// types
import { AuthProps, JWTContextType } from 'types/auth';
import { KeyedObject } from 'types/root';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const ACCESS_TOKEN_KEY = 'serviceToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);
  return decoded.exp > Date.now() / 1000;
};

const setSession = (accessToken?: string | null, refreshToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else if (accessToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken && verifyToken(accessToken)) {
          setSession(accessToken);
          const response = await axios.get('/api/v1/users/me');
          const user = response.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({ type: LOGOUT });
        }
      } catch (err) {
        console.error(err);
        dispatch({ type: LOGOUT });
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/v1/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    setSession(accessToken, refreshToken);

    const userResponse = await axios.get('/api/v1/users/me');
    const user = userResponse.data;

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });

    if (user.roles?.includes('ADMIN')) {
      redirectWithBasePath('/sample-page');
    } else {
      redirectWithBasePath('/');
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    await axios.post('/api/v1/auth/register', {
      email,
      password,
      fullName,
      phone
    });
  };

  const forgotPassword = async (email: string) => {
    await axios.post('/api/v1/auth/forgot-password', { email });
  };

  const verifyOtp = async (email: string, code: string, type: string) => {
    await axios.post('/api/v1/auth/verify-otp', { email, code, type });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await axios.post('/api/v1/auth/reset-password', { email, code, newPassword });
  };

  const logout = () => {
    setSession(null, null);
    dispatch({ type: LOGOUT });
    redirectWithBasePath('/');
  };

  const hasRole = (role: string) => {
    return state.user?.roles?.includes(role) ?? false;
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext
      value={{
        ...state,
        login,
        logout,
        register,
        forgotPassword,
        verifyOtp,
        resetPassword,
        hasRole,
        updateProfile
      }}
    >
      {children}
    </JWTContext>
  );
};

export default JWTContext;
