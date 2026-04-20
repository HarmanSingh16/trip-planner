import { useState, useCallback, useRef, useEffect, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTrips } from "../hooks/useTrips";
import { createTrip, updateTrip, deleteTrip } from "../services/tripService";
import { CurrencyContext } from "../context/CurrencyContext";
import TripCard from "../components/TripCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { trips, loading } = useTrips();
  const { currency } = useContext(CurrencyContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
    currency: "USD",
    coverImageURL: "",
  });

  // Focus first input when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  const openCreateModal = useCallback(() => {
    setEditingTrip(null);
    setForm({
      destination: "",
      startDate: "",
      endDate: "",
      totalBudget: "",
      currency: currency,
      coverImageURL: "",
    });
    setFormError("");
    setModalOpen(true);
  }, [currency]);

  const openEditModal = useCallback((trip) => {
    setEditingTrip(trip);
    const fmtDate = (d) => {
      if (!d) return "";
      const date = d.toDate ? d.toDate() : new Date(d);
      return date.toISOString().split("T")[0];
    };
    setForm({
      destination: trip.destination || "",
      startDate: fmtDate(trip.startDate),
      endDate: fmtDate(trip.endDate),
      totalBudget: trip.totalBudget?.toString() || "",
      currency: trip.currency || "USD",
      coverImageURL: trip.coverImageURL || "",
    });
    setFormError("");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTrip(null);
    setFormError("");
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");

      if (!form.destination.trim()) {
        return setFormError("Destination is required.");
      }

      setSubmitting(true);
      try {
        const tripData = {
          ...form,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
          totalBudget: Number(form.totalBudget) || 0,
        };

        if (editingTrip) {
          await updateTrip(currentUser.uid, editingTrip.id, tripData);
        } else {
          await createTrip(currentUser.uid, tripData);
        }
        closeModal();
      } catch (err) {
        setFormError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [form, editingTrip, currentUser, closeModal]
  );

  const handleDelete = useCallback(
    async (trip) => {
      if (!window.confirm(`Delete "${trip.destination}"? This cannot be undone.`))
        return;
      try {
        await deleteTrip(currentUser.uid, trip.id);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [currentUser]
  );

  const filteredTrips = trips.filter((t) =>
    t.destination?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your trips..." />;
  }

  return (
    <div className="dashboard-page" id="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Your Trips</h1>
          <p>Plan, organize, and track every adventure.</p>
        </div>
        <button
          className="btn btn-primary btn-create-trip"
          onClick={openCreateModal}
          id="btn-create-trip"
        >
          <span className="btn-icon">+</span>
          Create Trip
        </button>
      </div>

      {/* Search */}
      {trips.length > 0 && (
        <div className="dashboard-search">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips…"
            className="form-input search-input"
            id="search-trips"
          />
        </div>
      )}

      {/* Trip Grid */}
      {filteredTrips.length === 0 ? (
        <div className="empty-state" id="empty-state">
          <div className="empty-illustration">🌍</div>
          <h2>
            {trips.length === 0
              ? "No trips yet"
              : "No matching trips"}
          </h2>
          <p>
            {trips.length === 0
              ? "Create your first trip and start planning your adventure!"
              : "Try a different search term."}
          </p>
          {trips.length === 0 && (
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              id="btn-create-first-trip"
            >
              Create Your First Trip
            </button>
          )}
        </div>
      ) : (
        <div className="trip-grid" id="trip-grid">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal} id="trip-modal-backdrop">
          <div
            className="modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            id="trip-modal"
          >
            <div className="modal-header">
              <h2>{editingTrip ? "Edit Trip" : "Create New Trip"}</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="alert alert-error">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  id="destination"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="e.g. Paris, France"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalBudget">Total Budget</label>
                  <input
                    type="number"
                    id="totalBudget"
                    name="totalBudget"
                    value={form.totalBudget}
                    onChange={handleChange}
                    placeholder="5000"
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="INR">₹ INR</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="coverImageURL">Cover Image URL</label>
                <input
                  type="url"
                  id="coverImageURL"
                  name="coverImageURL"
                  value={form.coverImageURL}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  id="btn-save-trip"
                >
                  {submitting
                    ? "Saving…"
                    : editingTrip
                    ? "Update Trip"
                    : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
