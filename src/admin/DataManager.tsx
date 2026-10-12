import React, { useEffect, useState } from "react";
import { PiMicrosoftExcelLogoLight } from "react-icons/pi";
import "./DataManager.css"; // reuse existing styles
import { adminFetch } from "../utils/adminAuth";

interface Registration {
  _id: string;
  eventName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  attendees: number;
  specialRequests?: string;
  timestamp: string;
}

interface Subscribe {
  _id: string;
  email: string;
}

const DataManager: React.FC = () => {
  const [tab, setTab] = useState<"registrations" | "subscribers">("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [subscribers, setSubscribers] = useState<Subscribe[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data for both tabs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regsRes, subsRes] = await Promise.all([
          adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/registrations"),
          adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/subscribe"),
        ]);
        const [regsData, subsData] = await Promise.all([regsRes.json(), subsRes.json()]);
        setRegistrations(regsData);
        setSubscribers(subsData);
      } catch (err) {
        console.error("Error loading registration/subscriber data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group registrations by event name
  const grouped = registrations.reduce((acc: Record<string, Registration[]>, reg) => {
    if (!acc[reg.eventName]) acc[reg.eventName] = [];
    acc[reg.eventName].push(reg);
    return acc;
  }, {});

  // Export registrations to CSV
  const exportRegistrations = (eventName: string, regs: Registration[]) => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Attendees",
      "Special Requests",
      "Timestamp",
    ];
    const rows = regs.map((r) => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone || "-",
      r.attendees,
      r.specialRequests || "-",
      new Date(r.timestamp).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const safeName = eventName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${safeName}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export subscribers to CSV
  const exportSubscribers = () => {
    const headers = ["Email"];
    const rows = subscribers.map((s) => [s.email]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="data-manager">

      {/* Tabs */}
      <div className="tab-toggle">
        <button
          className={tab === "registrations" ? "active" : ""}
          onClick={() => setTab("registrations")}
        >
          Registrations
        </button>
        <button
          className={tab === "subscribers" ? "active" : ""}
          onClick={() => setTab("subscribers")}
        >
          Subscribers
        </button>
      </div>

      {/* Registrations tab */}
      {tab === "registrations" && (
        <div>
          {Object.keys(grouped).length === 0 ? (
            <p>No registrations yet.</p>
          ) : (
            Object.entries(grouped).map(([eventName, regs]) => (
              <div key={eventName} className="event-section">
                <h3 className="event-header">{eventName}</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Attendees</th>
                        <th>Special Requests</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regs.map((r) => (
                        <tr key={r._id}>
                          <td>{r.firstName} {r.lastName}</td>
                          <td>{r.email}</td>
                          <td>{r.phone || "-"}</td>
                          <td>{r.attendees}</td>
                          <td>{r.specialRequests || "-"}</td>
                          <td>{new Date(r.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={() => exportRegistrations(eventName, regs)}
                    className="export-button"
                  >
                    <PiMicrosoftExcelLogoLight /> Export Registrations
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subscribers tab */}
      {tab === "subscribers" && (
        <div className="subscription-manager">
          {subscribers.length === 0 ? (
            <p>No subscribers yet.</p>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s._id}>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button onClick={exportSubscribers} className="export-button">
                  <PiMicrosoftExcelLogoLight /> Export Subscribers
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DataManager;
