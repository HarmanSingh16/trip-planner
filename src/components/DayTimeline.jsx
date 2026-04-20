import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORY_ICONS = {
  food: "🍽️",
  transport: "🚗",
  activity: "🎯",
  accommodation: "🏨",
};

/**
 * Sortable activity card within a day
 */
function SortableActivity({ activity, onDelete, dayId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`activity-card ${isDragging ? "dragging" : ""}`}
      id={`activity-${activity.id}`}
    >
      <div className="activity-drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <div className="activity-icon">
        {CATEGORY_ICONS[activity.category] || "📌"}
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-time">{activity.time}</span>
          <span className={`activity-category cat-${activity.category}`}>
            {activity.category}
          </span>
        </div>
        <h4 className="activity-name">{activity.name}</h4>
        {activity.location && (
          <p className="activity-location">📍 {activity.location}</p>
        )}
        {activity.notes && (
          <p className="activity-notes">{activity.notes}</p>
        )}
      </div>
      <button
        className="btn btn-ghost btn-sm btn-danger activity-delete"
        onClick={() => onDelete(dayId, activity.id)}
        aria-label="Delete activity"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * DayTimeline renders a single day's worth of activities in a vertical timeline,
 * with drag-and-drop reorder support.
 */
export default function DayTimeline({
  day,
  activities = [],
  onReorder,
  onDeleteActivity,
  onAddActivity,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    time: "09:00",
    location: "",
    notes: "",
    category: "activity",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [activities]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedActivities.findIndex((a) => a.id === active.id);
      const newIndex = sortedActivities.findIndex((a) => a.id === over.id);
      const newOrder = arrayMove(sortedActivities, oldIndex, newIndex);
      onReorder(day.id, newOrder);
    },
    [sortedActivities, onReorder, day.id]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!form.name.trim()) return;
      onAddActivity(day.id, { ...form });
      setForm({
        name: "",
        time: "09:00",
        location: "",
        notes: "",
        category: "activity",
      });
      setShowForm(false);
    },
    [form, onAddActivity, day.id]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const dayLabel = useMemo(() => {
    if (day.label) return day.label;
    const d = day.date?.toDate ? day.date.toDate() : new Date(day.date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [day]);

  return (
    <div className="day-timeline" id={`day-${day.id}`}>
      <div className="day-header">
        <h3 className="day-label">{dayLabel}</h3>
        <span className="day-activity-count">
          {sortedActivities.length} {sortedActivities.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      {/* Timeline */}
      <div className="timeline-track">
        {sortedActivities.length === 0 ? (
          <div className="timeline-empty">
            <p>No activities yet. Add your first one!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedActivities.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedActivities.map((activity) => (
                <SortableActivity
                  key={activity.id}
                  activity={activity}
                  onDelete={onDeleteActivity}
                  dayId={day.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add activity */}
      {!showForm ? (
        <button
          className="btn btn-outline btn-sm add-activity-btn"
          onClick={() => setShowForm(true)}
          id={`add-activity-${day.id}`}
        >
          + Add Activity
        </button>
      ) : (
        <form className="activity-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Activity name"
              className="form-input"
              required
              autoFocus
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="form-input time-input"
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location"
              className="form-input"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="activity">🎯 Activity</option>
              <option value="food">🍽️ Food</option>
              <option value="transport">🚗 Transport</option>
              <option value="accommodation">🏨 Accommodation</option>
            </select>
          </div>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes (optional)"
            className="form-textarea"
            rows={2}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              Add
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
