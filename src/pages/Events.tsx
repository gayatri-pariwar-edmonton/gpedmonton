import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import "./Events.css";

const Events: React.FC = () => {
  const [upcomingEvents, setUpcoming] = useState<any[]>([]);
  const [pastEvents, setPast] = useState<any[]>([]);
  const [_, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
        fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/upcoming").then(res => res.json()),
        fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/events/past").then(res => res.json())
    ])
    .then(([upcomingData, pastData]) => {
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
        setPast(Array.isArray(pastData) ? pastData : []);
    })
    .catch(err => console.error("Error fetching events:", err))
    .finally(() => setLoading(false));
  }, []);


  return (
    <main>
      <section className="upcoming-events-section">
        <h1>Upcoming Events</h1>
        <div>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => (
              <EventCard
                key={event._id}
                name={event.name}
                image={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/image/${event.driveFileId}`}
                desc={event.desc}
                timestamp={event.timestamp}
              />
            ))
          ) : (
            <p>No upcoming events right now.</p>
          )}
        </div>
      </section>

      <section className="past-events-section">
        <h2>Past Events</h2>
        <div className="past-events-posters">
          {pastEvents.length > 0 ? (
            pastEvents.map(event => (
              <div key={event._id}>
                <img
                  src={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/image/${event.driveFileId}`}
                  alt={event.name}
                  className="past-event-img"
                />
                <h3>{event.title}</h3>
              </div>
            ))
          ) : (
            <p>No past events yet.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Events;
