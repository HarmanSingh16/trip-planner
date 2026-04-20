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
 * Reference to expenses subcollection
 */
function expensesCollection(uid, tripId) {
  return collection(db, "users", uid, "trips", tripId, "expenses");
}

/**
 * Subscribe to all expenses for a trip (real-time)
 */
export function subscribeToExpenses(uid, tripId, callback) {
  const q = query(expensesCollection(uid, tripId), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(expenses);
  });
}

/**
 * Add a new expense
 */
export async function addExpense(uid, tripId, expenseData) {
  const docRef = await addDoc(expensesCollection(uid, tripId), {
    label: expenseData.label,
    amount: Number(expenseData.amount) || 0,
    category: expenseData.category || "misc",
    date: expenseData.date || serverTimestamp(),
    note: expenseData.note || "",
  });
  return docRef.id;
}

/**
 * Update an expense
 */
export async function updateExpense(uid, tripId, expenseId, data) {
  const expRef = doc(
    db,
    "users",
    uid,
    "trips",
    tripId,
    "expenses",
    expenseId
  );
  await updateDoc(expRef, data);
}

/**
 * Delete an expense
 */
export async function deleteExpense(uid, tripId, expenseId) {
  const expRef = doc(
    db,
    "users",
    uid,
    "trips",
    tripId,
    "expenses",
    expenseId
  );
  await deleteDoc(expRef);
}
