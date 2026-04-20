import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { subscribeToTrips } from "../services/tripService";
import { subscribeToExpenses } from "../services/budgetService";
import { TripProvider } from "../context/TripContext";
import { CurrencyContext } from "../context/CurrencyContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Itinerary from "./Itinerary";
import BudgetTracker from "./BudgetTracker";

export default function TripPlanner() {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const { formatCurrency, convert } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const uid = currentUser?.uid;

  useEffect(() => {
    if (!uid || !tripId) return;
    const unsub = subscribeToTrips(uid, (trips) => {
      setTrip(trips.find((t) => t.id === tripId) || null);
      setLoading(false);
    });
    return unsub;
  }, [uid, tripId]);

  useEffect(() => {
    if (!uid || !tripId) return;
    const unsub = subscribeToExpenses(uid, tripId, (expenses) => {
      setTotalSpent(expenses.reduce((s, e) => s + (e.amount || 0), 0));
    });
    return unsub;
  }, [uid, tripId]);

  const activeTab = useMemo(() => {
    if (location.pathname.includes("/itinerary")) return "itinerary";
    if (location.pathname.includes("/budget")) return "budget";
    return "overview";
  }, [location.pathname]);

  const dateRange = useMemo(() => {
    if (!trip) return "";
    const fmt = (d) => {
      if (!d) return "—";
      const dt = d.toDate ? d.toDate() : new Date(d);
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    return `${fmt(trip.startDate)} – ${fmt(trip.endDate)}`;
  }, [trip]);

  const remaining = (trip?.totalBudget || 0) - totalSpent;
  const budgetPct = trip?.totalBudget > 0 ? Math.min((totalSpent / trip.totalBudget) * 100, 100) : 0;

  if (loading) return <LoadingSpinner size="lg" text="Loading trip..." />;
  if (!trip) return (
    <div className="empty-state" id="trip-not-found">
      <div className="empty-illustration">🔍</div>
      <h2>Trip not found</h2>
      <p>This trip may have been deleted.</p>
      <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );

  return (
    <TripProvider>
      <div className="trip-planner-page" id="trip-planner-page">
        {/* Hero */}
        <div className="trip-hero" style={trip.coverImageURL ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15,15,30,0.95)), url(${trip.coverImageURL})` } : {}}>
          <button className="btn btn-ghost btn-back" onClick={() => navigate("/dashboard")}>← Back</button>
          <div className="trip-hero-content">
            <h1>{trip.destination}</h1>
            <p className="trip-hero-dates">{dateRange}</p>
            {trip.totalBudget > 0 && (
              <div className="trip-hero-budget">
                <div className="hero-budget-stats">
                  <div className="hero-budget-item"><span className="hero-budget-label">Budget</span><span className="hero-budget-value">{formatCurrency(convert(trip.totalBudget, trip.currency || "USD"))}</span></div>
                  <div className="hero-budget-item"><span className="hero-budget-label">Spent</span><span className="hero-budget-value spent">{formatCurrency(convert(totalSpent, trip.currency || "USD"))}</span></div>
                  <div className="hero-budget-item"><span className="hero-budget-label">Remaining</span><span className={`hero-budget-value ${remaining < 0 ? "over-budget" : "remaining"}`}>{formatCurrency(convert(Math.abs(remaining), trip.currency || "USD"))}{remaining < 0 ? " over" : ""}</span></div>
                </div>
                <div className="hero-budget-bar"><div className={`hero-budget-bar-fill ${budgetPct > 90 ? "over-budget" : ""}`} style={{ width: `${budgetPct}%` }}></div></div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="trip-tabs" id="trip-tabs">
          <Link to={`/trips/${tripId}`} className={`trip-tab ${activeTab === "overview" ? "active" : ""}`}>Overview</Link>
          <Link to={`/trips/${tripId}/itinerary`} className={`trip-tab ${activeTab === "itinerary" ? "active" : ""}`}>Itinerary</Link>
          <Link to={`/trips/${tripId}/budget`} className={`trip-tab ${activeTab === "budget" ? "active" : ""}`}>Budget</Link>
        </div>

        {/* Tab content */}
        <div className="trip-tab-content">
          {activeTab === "overview" && (
            <div className="trip-overview" id="trip-overview">
              <div className="overview-grid">
                <div className="overview-card clickable" onClick={() => navigate(`/trips/${tripId}/itinerary`)}><span className="overview-card-icon">📅</span><h3>Itinerary</h3><p>Plan your day-by-day activities</p></div>
                <div className="overview-card clickable" onClick={() => navigate(`/trips/${tripId}/budget`)}><span className="overview-card-icon">💰</span><h3>Budget</h3><p>Track expenses and spending</p></div>
                <div className="overview-card"><span className="overview-card-icon">📄</span><h3>Documents</h3><p>Coming soon — store tickets & bookings</p></div>
              </div>
            </div>
          )}
          {activeTab === "itinerary" && <Itinerary />}
          {activeTab === "budget" && <BudgetTracker />}
        </div>
      </div>
    </TripProvider>
  );
}
