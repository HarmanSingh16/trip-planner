import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  signUp as firebaseSignUp,
  logIn as firebaseLogIn,
  logOut as firebaseLogOut,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    return await firebaseSignUp(email, password, displayName);
  }, []);

  const login = useCallback(async (email, password) => {
    return await firebaseLogIn(email, password);
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogOut();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signup,
      login,
      logout,
    }),
    [currentUser, loading, signup, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
