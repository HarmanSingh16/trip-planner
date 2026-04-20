import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useItinerary } from "../hooks/useItinerary";
import DayTimeline from "../components/DayTimeline";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Itinerary() {
  const { tripId } = useParams();
  const { days, activitiesByDay, loading, addDay, addActivity, deleteActivity, reorderActivities } = useItinerary(tripId);
  const [showDayForm, setShowDayForm] = useState(false);
  const [dayForm, setDayForm] = useState({ date: "", label: "" });

  const handleAddDay = useCallback(async (e) => {
    e.preventDefault();
    if (!dayForm.date) return;
    await addDay({ date: new Date(dayForm.date), label: dayForm.label });
    setDayForm({ date: "", label: "" });
    setShowDayForm(false);
  }, [dayForm, addDay]);

  const handleAddActivity = useCallback(async (dayId, actData) => {
    await addActivity(dayId, actData);
  }, [addActivity]);

  const handleDeleteActivity = useCallback(async (dayId, actId) => {
    await deleteActivity(dayId, actId);
  }, [deleteActivity]);

  const handleReorder = useCallback(async (dayId, ordered) => {
    await reorderActivities(dayId, ordered);
  }, [reorderActivities]);

  const sortedDays = useMemo(() => {
    return [...days].sort((a, b) => {
      const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return da - db;
    });
  }, [days]);

  if (loading) return <LoadingSpinner size="lg" text="Loading itinerary..." />;

  return (
    <div className="itinerary-page" id="itinerary-page">
      <div className="itinerary-header">
        <h2>Itinerary</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowDayForm(true)} id="btn-add-day">+ Add Day</button>
      </div>

      {showDayForm && (
        <form className="day-form card" onSubmit={handleAddDay}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="day-date">Date</label>
              <input type="date" id="day-date" value={dayForm.date} onChange={(e) => setDayForm(p => ({ ...p, date: e.target.value }))} className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="day-label">Label (optional)</label>
              <input type="text" id="day-label" value={dayForm.label} onChange={(e) => setDayForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Arrival Day" className="form-input" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">Add Day</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowDayForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {sortedDays.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">📅</div>
          <h2>No days planned yet</h2>
          <p>Add your first day to start building the itinerary!</p>
        </div>
      ) : (
        <div className="days-list">
          {sortedDays.map((day) => (
            <DayTimeline
              key={day.id}
              day={day}
              activities={activitiesByDay[day.id] || []}
              onReorder={handleReorder}
              onDeleteActivity={handleDeleteActivity}
              onAddActivity={handleAddActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
