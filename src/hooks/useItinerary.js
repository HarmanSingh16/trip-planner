import { useState, useEffect, useCallback } from "react";
import {
  subscribeToDays,
  subscribeToActivities,
  addDay as addDayService,
  addActivity as addActivityService,
  updateActivity as updateActivityService,
  deleteActivity as deleteActivityService,
  reorderActivities as reorderActivitiesService,
} from "../services/itineraryService";
import { useAuth } from "./useAuth";

/**
 * Hook that manages itinerary state (days + activities) for a trip.
 */
export function useItinerary(tripId) {
  const { currentUser } = useAuth();
  const [days, setDays] = useState([]);
  const [activitiesByDay, setActivitiesByDay] = useState({});
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.uid;

  // Subscribe to days
  useEffect(() => {
    if (!uid || !tripId) return;
    setLoading(true);

    const unsubscribe = subscribeToDays(uid, tripId, (daysData) => {
      setDays(daysData);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid, tripId]);

  // Subscribe to activities for each day
  useEffect(() => {
    if (!uid || !tripId || days.length === 0) return;

    const unsubscribes = days.map((day) =>
      subscribeToActivities(uid, tripId, day.id, (activities) => {
        setActivitiesByDay((prev) => ({
          ...prev,
          [day.id]: activities,
        }));
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [uid, tripId, days]);

  const addDay = useCallback(
    async (dayData) => {
      if (!uid || !tripId) return;
      return await addDayService(uid, tripId, dayData);
    },
    [uid, tripId]
  );

  const addActivity = useCallback(
    async (dayId, activityData) => {
      if (!uid || !tripId) return;
      // Optimistic: figure order from current activities
      const currentActivities = activitiesByDay[dayId] || [];
      activityData.order = currentActivities.length;
      return await addActivityService(uid, tripId, dayId, activityData);
    },
    [uid, tripId, activitiesByDay]
  );

  const updateActivity = useCallback(
    async (dayId, activityId, data) => {
      if (!uid || !tripId) return;
      await updateActivityService(uid, tripId, dayId, activityId, data);
    },
    [uid, tripId]
  );

  const deleteActivity = useCallback(
    async (dayId, activityId) => {
      if (!uid || !tripId) return;
      await deleteActivityService(uid, tripId, dayId, activityId);
    },
    [uid, tripId]
  );

  const reorderActivities = useCallback(
    async (dayId, orderedActivities) => {
      if (!uid || !tripId) return;
      // Optimistic update
      setActivitiesByDay((prev) => ({
        ...prev,
        [dayId]: orderedActivities,
      }));
      await reorderActivitiesService(uid, tripId, dayId, orderedActivities);
    },
    [uid, tripId]
  );

  return {
    days,
    activitiesByDay,
    loading,
    addDay,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
  };
}
