import React, { useState, useEffect } from "react";
import "./EventManager.css";
import { adminFetch } from "../utils/adminAuth";

interface UpcomingEvent {
  _id?: string;
  name: string;
  desc: string;
  imageUrl?: string;
  timestamp?: number;
  driveFileId?: string;
}

interface PastEvent {
  _id?: string;
  title: string;
  imageUrl?: string;
  driveFileId?: string;
}

const EventManager: React.FC = () => {
  const [view, setView] = useState<"upcoming" | "past">("upcoming");

  const [upcomingEvents, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [pastEvents, setPast] = useState<PastEvent[]>([]);

  // Form states
  const [newUpcoming, setNewUpcoming] = useState({
    name: "",
    eventDate: "",
    eventTime: "",
    desc: "",
  });

  const [newPast, setNewPast] = useState({ title: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const TZ = "America/Edmonton";

  const formatEdmontonDateTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("en-CA", {
      timeZone: TZ,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };


  // Load events on mount
  useEffect(() => {
    Promise.all([
      adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/upcoming").then((r) => r.json()),
      adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/past").then((r) => r.json()),
    ])
      .then(([upcomingData, pastData]) => {
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
        setPast(Array.isArray(pastData) ? pastData : []);
      })
      .catch((err) => console.error("Error loading events:", err));
  }, []);

  // Handle text and date/time inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (view === "upcoming") setNewUpcoming((prev) => ({ ...prev, [name]: value }));
    else setNewPast((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload an image.");

    const formData = new FormData();
    let url = "";

    if (view === "upcoming") {
      const { name, desc, eventDate, eventTime } = newUpcoming;

      if (!eventDate || !eventTime) return alert("Please select date & time.");

      const combined = `${eventDate}T${eventTime}`;
      const timestamp = new Date(combined).getTime();

      if (isNaN(timestamp)) return alert("Invalid date/time.");

      const now = Date.now();

      // Decide target collection based on time
      const isPast = timestamp < now;

      if (isPast) {
        // Save to Past Event collection
        formData.append("title", name); // Past events use `title`
        formData.append("image", imageFile);
        url = "https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/past/upload";
      } else {
        // Save to Upcoming Event collection
        formData.append("name", name);
        formData.append("desc", desc);
        formData.append("timestamp", String(timestamp));
        formData.append("image", imageFile);
        url = "https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/upcoming/upload";
      }

      try {
        const res = await adminFetch(url, { method: "POST", body: formData });
        const data = await res.json();

        if (isPast) setPast((prev) => [...prev, data]);
        else setUpcoming((prev) => [...prev, data]);

        // reset form
        setNewUpcoming({ name: "", eventDate: "", eventTime: "", desc: "" });
        setImageFile(null);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload event.");
      }
    } else {
      // Manual past event upload (tab explicitly selected)
      const { title } = newPast;
      formData.append("title", title);
      formData.append("image", imageFile);
      url = "https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/past/upload";

      try {
        const res = await adminFetch(url, { method: "POST", body: formData });
        const data = await res.json();
        setPast((prev) => [...prev, data]);
        setNewPast({ title: "" });
        setImageFile(null);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload event.");
      }
    }
  };


  // Delete event
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const endpoint =
      view === "upcoming"
        ? `https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/upcoming/${id}`
        : `https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/past/${id}`;
    await adminFetch(endpoint, { method: "DELETE" });
    if (view === "upcoming")
      setUpcoming((prev) => prev.filter((e) => e._id !== id));
    else setPast((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="event-manager">
      {/* Tab switcher */}
      <div className="tab-toggle">
        <button
          className={view === "upcoming" ? "active" : ""}
          onClick={() => setView("upcoming")}
        >
          Upcoming Events
        </button>
        <button
          className={view === "past" ? "active" : ""}
          onClick={() => setView("past")}
        >
          Past Events
        </button>
      </div>

      {/* Forms */}
      <form onSubmit={handleSubmit} className="event-form">
        {view === "upcoming" ? (
          <>
            <input
              type="text"
              name="name"
              placeholder="Event Name"
              value={newUpcoming.name}
              onChange={handleChange}
              required
            />

            <label>Date</label>
            <input
              type="date"
              name="eventDate"
              value={newUpcoming.eventDate}
              onChange={handleChange}
              required
            />

            <label>Time</label>
            <input
              type="time"
              name="eventTime"
              value={newUpcoming.eventTime}
              onChange={handleChange}
              required
            />

            <textarea
              name="desc"
              placeholder="Event Description"
              value={newUpcoming.desc}
              onChange={handleChange}
              required
            />
          </>
        ) : (
          <>
            <input
              type="text"
              name="title"
              placeholder="Past Event Title"
              value={newPast.title}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} required />
        <button type="submit">Upload {view === "upcoming" ? "Upcoming" : "Past"} Event</button>
      </form>

      {/* Event List */}
      <div className="event-list">
        {(view === "upcoming" ? upcomingEvents : pastEvents).map((event) => (
          <div key={event._id} className="event-item">
            <img
              src={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/image/${event.driveFileId}`}
              alt={"name" in event ? event.name : event.title}
            />
            <div>
              <h3>{"name" in event ? event.name : event.title}</h3>
              {"timestamp" in event && <p>{formatEdmontonDateTime(event.timestamp)}</p>}
              <button onClick={() => handleDelete(event._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManager;
