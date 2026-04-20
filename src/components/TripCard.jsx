import { useMemo, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";

const DEFAULT_COVERS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

export default function TripCard({ trip, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { formatCurrency, convert } = useContext(CurrencyContext);

  const coverStyle = useMemo(() => {
    if (trip.coverImageURL) {
      return {
        backgroundImage: `url(${trip.coverImageURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Deterministic gradient based on trip id
    const idx =
      trip.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      DEFAULT_COVERS.length;
    return { background: DEFAULT_COVERS[idx] };
  }, [trip.coverImageURL, trip.id]);

  const dateRange = useMemo(() => {
    const fmt = (d) => {
      if (!d) return "—";
      const date = d.toDate ? d.toDate() : new Date(d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };
    return `${fmt(trip.startDate)} – ${fmt(trip.endDate)}`;
  }, [trip.startDate, trip.endDate]);

  const budgetPercent = useMemo(() => {
    if (!trip.totalBudget || trip.totalBudget <= 0) return 0;
    const spent = trip.totalSpent || 0;
    return Math.min((spent / trip.totalBudget) * 100, 100);
  }, [trip.totalBudget, trip.totalSpent]);

  const handleClick = useCallback(() => {
    navigate(`/trips/${trip.id}`);
  }, [navigate, trip.id]);

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit?.(trip);
    },
    [onEdit, trip]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete?.(trip);
    },
    [onDelete, trip]
  );

  return (
    <div className="trip-card" onClick={handleClick} id={`trip-card-${trip.id}`}>
      {/* Cover */}
      <div className="trip-card-cover" style={coverStyle}>
        <div className="trip-card-overlay">
          <h3 className="trip-card-destination">{trip.destination}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="trip-card-body">
        <p className="trip-card-dates">{dateRange}</p>

        {/* Budget bar */}
        {trip.totalBudget > 0 && (
          <div className="trip-card-budget">
            <div className="budget-bar-labels">
              <span className="budget-spent">
                {formatCurrency(convert(trip.totalSpent || 0, trip.currency || "USD"))} spent
              </span>
              <span className="budget-total">
                of {formatCurrency(convert(trip.totalBudget, trip.currency || "USD"))}
              </span>
            </div>
            <div className="budget-bar">
              <div
                className={`budget-bar-fill ${budgetPercent > 90 ? "over-budget" : ""}`}
                style={{ width: `${budgetPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="trip-card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleEdit}
            id={`edit-trip-${trip.id}`}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-ghost btn-sm btn-danger"
            onClick={handleDelete}
            id={`delete-trip-${trip.id}`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
