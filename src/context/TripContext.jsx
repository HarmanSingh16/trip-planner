import { createContext, useState, useCallback, useMemo } from "react";

export const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const updateCurrentTrip = useCallback((trip) => {
    setCurrentTrip(trip);
  }, []);

  const updateItinerary = useCallback((days) => {
    setItinerary(days);
  }, []);

  const updateExpenses = useCallback((exp) => {
    setExpenses(exp);
  }, []);

  const value = useMemo(
    () => ({
      currentTrip,
      setCurrentTrip: updateCurrentTrip,
      itinerary,
      setItinerary: updateItinerary,
      expenses,
      setExpenses: updateExpenses,
    }),
    [currentTrip, updateCurrentTrip, itinerary, updateItinerary, expenses, updateExpenses]
  );

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}
