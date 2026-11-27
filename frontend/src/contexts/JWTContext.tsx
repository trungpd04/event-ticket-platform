import React, { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios, { redirectWithBasePath } from 'utils/axios';

// types
import { AuthProps, JWTContextType } from 'types/auth';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const ACCESS_TOKEN_KEY = 'serviceToken';

const setSession = (accessToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
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
        window.localStorage.removeItem('refreshToken');

        if (accessToken) {
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
    const { accessToken } = response.data;
    setSession(accessToken);

    const userResponse = await axios.get('/api/v1/users/me');
    const user = userResponse.data;

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });

  };

  const googleLogin = async (idToken: string) => {
    const response = await axios.post('/api/v1/auth/google', { idToken });
    setSession(response.data.accessToken);

    const userResponse = await axios.get('/api/v1/users/me');
    const user = userResponse.data;
    dispatch({ type: LOGIN, payload: { isLoggedIn: true, user } });
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

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } finally {
      setSession(null);
      dispatch({ type: LOGOUT });
      redirectWithBasePath('/');
    }
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
        googleLogin,
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
