import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Calendar.css";

interface EventData {
  _id: string;
  name: string;
  timestamp: number;
  desc?: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const navigate = useNavigate();

  const TZ = "America/Edmonton";

  const formatEdmontonDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-CA", { timeZone: TZ });

  const formatEdmontonDateTime = (ts: number) =>
    new Date(ts).toLocaleString("en-CA", {
      timeZone: TZ,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  useEffect(() => {
    fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/upcoming")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  return (
    <div className="calendar-wrapper">
      {/* Full Calendar */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          timeZone="America/Edmonton"
          height="auto"
          contentHeight="auto"
          aspectRatio={1.6}        // ensures full month width
          events={events.map((e) => ({
            id: e._id,
            title: e.name,
            start: formatEdmontonDate(e.timestamp), // preferred over `date`
            extendedProps: {
              desc: e.desc,
              date: formatEdmontonDate(e.timestamp),
            },
          }))}
          eventColor="#ff7b00"
          eventClick={(info) => {
              info.jsEvent.preventDefault();
              navigate(`/events/register/${encodeURIComponent(info.event.title)}`, {
                state: {
                  eventName: info.event.title,
                  desc: info.event.extendedProps.desc,
                  date: formatEdmontonDateTime(info.event.start!.getTime()),
                },
              });
          }}
        />
      </div>
      {/* Event List Sidebar */}
      <div className="calendar-side">
        <h3>Registration for upcoming Events</h3>
        {events.length > 0 ? (
          <ul>
            {events.map((e) => (
              <li key={e._id}>
                <a
                  href={`/events/register/${encodeURIComponent(e.name)}`}
                  onClick={(ev) => {
                    ev.preventDefault(); // stop full-page reload
                    navigate(`/events/register/${encodeURIComponent(e.name)}`, {
                      state: {
                        eventName: e.name,
                        desc: e.desc,
                        date: formatEdmontonDateTime(e.timestamp)
                      },
                    });
                  }}
                >
                  {e.name} — {formatEdmontonDate(e.timestamp)}
                  <FaArrowRight className="arrow-icon" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming events.</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;