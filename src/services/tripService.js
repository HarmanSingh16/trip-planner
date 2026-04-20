import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get reference to user's trips collection
 */
function tripsCollection(uid) {
  return collection(db, "users", uid, "trips");
}

/**
 * Create a new trip
 */
export async function createTrip(uid, tripData) {
  const docRef = await addDoc(tripsCollection(uid), {
    destination: tripData.destination,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    totalBudget: Number(tripData.totalBudget) || 0,
    currency: tripData.currency || "USD",
    coverImageURL: tripData.coverImageURL || "",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Subscribe to all trips for a user (real-time)
 */
export function subscribeToTrips(uid, callback) {
  const q = query(tripsCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(trips);
  });
}

/**
 * Update an existing trip
 */
export async function updateTrip(uid, tripId, data) {
  const tripRef = doc(db, "users", uid, "trips", tripId);
  await updateDoc(tripRef, data);
}

/**
 * Delete a trip
 */
export async function deleteTrip(uid, tripId) {
  const tripRef = doc(db, "users", uid, "trips", tripId);
  await deleteDoc(tripRef);
}
