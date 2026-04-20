import { useState, useEffect } from "react";
import { subscribeToTrips } from "../services/tripService";
import { useAuth } from "./useAuth";

/**
 * Hook that subscribes to all trips for the current user via onSnapshot.
 * Returns { trips, loading, error }.
 */
export function useTrips() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setTrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const unsubscribe = subscribeToTrips(currentUser.uid, (data) => {
        setTrips(data);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [currentUser]);

  return { trips, loading, error };
}
