import { useState, useEffect, useCallback, useMemo } from "react";
import {
  subscribeToExpenses,
  addExpense as addExpenseService,
  updateExpense as updateExpenseService,
  deleteExpense as deleteExpenseService,
} from "../services/budgetService";
import { useAuth } from "./useAuth";

/**
 * Hook that manages budget/expense state for a trip.
 */
export function useBudget(tripId, totalBudget = 0) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = currentUser?.uid;

  useEffect(() => {
    if (!uid || !tripId) return;
    setLoading(true);

    const unsubscribe = subscribeToExpenses(uid, tripId, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid, tripId]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [expenses]
  );

  const remaining = useMemo(
    () => totalBudget - totalSpent,
    [totalBudget, totalSpent]
  );

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    expenses.forEach((exp) => {
      const cat = exp.category || "misc";
      breakdown[cat] = (breakdown[cat] || 0) + (exp.amount || 0);
    });
    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  const addExpense = useCallback(
    async (expenseData) => {
      if (!uid || !tripId) return;
      return await addExpenseService(uid, tripId, expenseData);
    },
    [uid, tripId]
  );

  const updateExpense = useCallback(
    async (expenseId, data) => {
      if (!uid || !tripId) return;
      await updateExpenseService(uid, tripId, expenseId, data);
    },
    [uid, tripId]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      if (!uid || !tripId) return;
      // Optimistic update
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      await deleteExpenseService(uid, tripId, expenseId);
    },
    [uid, tripId]
  );

  return {
    expenses,
    totalSpent,
    remaining,
    categoryBreakdown,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
