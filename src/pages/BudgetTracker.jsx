import { useState, useCallback, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBudget } from "../hooks/useBudget";
import { subscribeToTrips } from "../services/tripService";
import { CurrencyContext } from "../context/CurrencyContext";
import BudgetChart from "../components/BudgetChart";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = [
  { value: "food", label: "🍽️ Food" },
  { value: "transport", label: "🚗 Transport" },
  { value: "stay", label: "🏨 Accommodation" },
  { value: "activity", label: "🎯 Activity" },
  { value: "misc", label: "📦 Misc" },
];

export default function BudgetTracker() {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const { currency, setCurrency, formatCurrency, convert } = useContext(CurrencyContext);

  const [trip, setTrip] = useState(null);
  const uid = currentUser?.uid;

  useEffect(() => {
    if (!uid || !tripId) return;
    const unsub = subscribeToTrips(uid, (trips) => {
      setTrip(trips.find((t) => t.id === tripId) || null);
    });
    return unsub;
  }, [uid, tripId]);

  const totalBudget = trip?.totalBudget || 0;
  const tripCurrency = trip?.currency || "USD";
  const { expenses, totalSpent, remaining, categoryBreakdown, loading, addExpense, deleteExpense } = useBudget(tripId, totalBudget);

  const [form, setForm] = useState({ label: "", amount: "", category: "misc", date: new Date().toISOString().split("T")[0], note: "" });
  const [showForm, setShowForm] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return;
    await addExpense({ ...form, amount: Number(form.amount), date: new Date(form.date) });
    setForm({ label: "", amount: "", category: "misc", date: new Date().toISOString().split("T")[0], note: "" });
    setShowForm(false);
  }, [form, addExpense]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Delete this expense?")) await deleteExpense(id);
  }, [deleteExpense]);

  const budgetPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return db - da;
    });
  }, [expenses]);

  if (loading) return <LoadingSpinner size="lg" text="Loading budget..." />;

  return (
    <div className="budget-page" id="budget-page">
      <div className="budget-header">
        <h2>Budget Tracker</h2>
        <div className="budget-header-actions">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select currency-select" id="currency-selector">
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="INR">₹ INR</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} id="btn-add-expense">+ Add Expense</button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="budget-summary card" id="budget-summary">
        <div className="budget-summary-stats">
          <div className="budget-stat">
            <span className="budget-stat-label">Total Budget</span>
            <span className="budget-stat-value">{formatCurrency(convert(totalBudget, tripCurrency))}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">Spent</span>
            <span className="budget-stat-value spent">{formatCurrency(convert(totalSpent, tripCurrency))}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">Remaining</span>
            <span className={`budget-stat-value ${remaining < 0 ? "over-budget" : "remaining"}`}>{formatCurrency(convert(Math.abs(remaining), tripCurrency))}{remaining < 0 ? " over" : ""}</span>
          </div>
        </div>
        <div className="budget-progress-bar">
          <div className={`budget-progress-fill ${budgetPct > 90 ? "over-budget" : ""}`} style={{ width: `${budgetPct}%` }}></div>
        </div>
      </div>

      <div className="budget-content">
        {/* Chart */}
        <BudgetChart categoryBreakdown={categoryBreakdown} tripCurrency={tripCurrency} />

        {/* Add expense form */}
        {showForm && (
          <form className="expense-form card" onSubmit={handleSubmit} id="expense-form">
            <h3>Add Expense</h3>
            <div className="form-row">
              <div className="form-group"><label>Label</label><input type="text" name="label" value={form.label} onChange={handleChange} placeholder="Lunch at café" className="form-input" required /></div>
              <div className="form-group"><label>Amount</label><input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className="form-input" min="0" step="0.01" required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Category</label><select name="category" value={form.category} onChange={handleChange} className="form-select">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div className="form-group"><label>Date</label><input type="date" name="date" value={form.date} onChange={handleChange} className="form-input" /></div>
            </div>
            <div className="form-group"><label>Note</label><input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Optional note" className="form-input" /></div>
            <div className="form-actions"><button type="submit" className="btn btn-primary btn-sm">Save</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        )}

        {/* Expense list */}
        <div className="expense-list" id="expense-list">
          <h3>Expenses ({expenses.length})</h3>
          {sortedExpenses.length === 0 ? (
            <div className="empty-state-sm"><p>No expenses yet. Track your first one!</p></div>
          ) : (
            <div className="expense-items">
              {sortedExpenses.map((exp) => {
                const d = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
                return (
                  <div className="expense-item" key={exp.id} id={`expense-${exp.id}`}>
                    <div className="expense-item-left">
                      <span className={`expense-cat-badge cat-${exp.category}`}>{exp.category}</span>
                      <div className="expense-item-info">
                        <span className="expense-item-label">{exp.label}</span>
                        <span className="expense-item-date">{d.toLocaleDateString()}</span>
                        {exp.note && <span className="expense-item-note">{exp.note}</span>}
                      </div>
                    </div>
                    <div className="expense-item-right">
                      <span className="expense-item-amount">{formatCurrency(convert(exp.amount, tripCurrency))}</span>
                      <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(exp.id)} aria-label="Delete expense">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
