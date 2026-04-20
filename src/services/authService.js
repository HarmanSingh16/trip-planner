import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Register a new user with email and password
 */
export async function signUp(email, password, displayName = "") {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

/**
 * Sign in an existing user
 */
export async function logIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

/**
 * Sign out the current user
 */
export async function logOut() {
  await signOut(auth);
}
