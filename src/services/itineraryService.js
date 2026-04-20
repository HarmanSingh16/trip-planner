import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Reference helpers
 */
function itineraryCollection(uid, tripId) {
  return collection(db, "users", uid, "trips", tripId, "itinerary");
}

function activitiesCollection(uid, tripId, dayId) {
  return collection(
    db,
    "users",
    uid,
    "trips",
    tripId,
    "itinerary",
    dayId,
    "activities"
  );
}

/**
 * Subscribe to all days for a trip
 */
export function subscribeToDays(uid, tripId, callback) {
  const q = query(itineraryCollection(uid, tripId), orderBy("date", "asc"));
  return onSnapshot(q, (snapshot) => {
    const days = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(days);
  });
}

/**
 * Subscribe to activities for a specific day
 */
export function subscribeToActivities(uid, tripId, dayId, callback) {
  const q = query(
    activitiesCollection(uid, tripId, dayId),
    orderBy("order", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(activities);
  });
}

/**
 * Add a new day to the itinerary
 */
export async function addDay(uid, tripId, dayData) {
  const docRef = await addDoc(itineraryCollection(uid, tripId), {
    date: dayData.date,
    label: dayData.label || "",
  });
  return docRef.id;
}

/**
 * Add a new activity to a day
 */
export async function addActivity(uid, tripId, dayId, activityData) {
  const docRef = await addDoc(activitiesCollection(uid, tripId, dayId), {
    name: activityData.name,
    time: activityData.time || "09:00",
    location: activityData.location || "",
    notes: activityData.notes || "",
    category: activityData.category || "activity",
    order: activityData.order || 0,
  });
  return docRef.id;
}

/**
 * Update an activity
 */
export async function updateActivity(uid, tripId, dayId, activityId, data) {
  const actRef = doc(
    db,
    "users",
    uid,
    "trips",
    tripId,
    "itinerary",
    dayId,
    "activities",
    activityId
  );
  await updateDoc(actRef, data);
}

/**
 * Delete an activity
 */
export async function deleteActivity(uid, tripId, dayId, activityId) {
  const actRef = doc(
    db,
    "users",
    uid,
    "trips",
    tripId,
    "itinerary",
    dayId,
    "activities",
    activityId
  );
  await deleteDoc(actRef);
}

/**
 * Reorder activities within a day (batch write)
 */
export async function reorderActivities(uid, tripId, dayId, orderedActivities) {
  const batch = writeBatch(db);
  orderedActivities.forEach((activity, index) => {
    const actRef = doc(
      db,
      "users",
      uid,
      "trips",
      tripId,
      "itinerary",
      dayId,
      "activities",
      activity.id
    );
    batch.update(actRef, { order: index });
  });
  await batch.commit();
}
