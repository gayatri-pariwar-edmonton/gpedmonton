import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import squareLogo from "../assets/images/logo.png";

const CancelRegistration: React.FC = () => {
  const [status, setStatus] = useState("Processing your cancellation...");
  const [_, setEventName] = useState<string>("");
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const cancelRegistration = async () => {
      try {
        const delRes = await fetch(`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/registrations/cancel/${id}`, {
          method: "DELETE",
        });

        if (delRes.ok) {
          const result = await delRes.json();
          setEventName(result.eventName);
          setStatus(`Your registration for "${result.eventName}" has been successfully cancelled.`);
        } else if (delRes.status === 404) {
          setStatus("Registration not found or already cancelled.");
        } else {
          setStatus("Something went wrong while cancelling your registration.");
        }
      } catch (err) {
        console.error("Error cancelling registration:", err);
        setStatus("Unable to reach the server. Please try again later.");
      }
    };

    if (id) cancelRegistration();
  }, [id]);

  return (
    <main style={{ textAlign: "center", padding: "3rem" }}>
      <img src={squareLogo} alt="GP Edmonton Logo" style={{ height: "80px" }} />
      <h1>Gayatri Pariwar Edmonton</h1>
      <h2>{status}</h2>
    </main>
  );
};

export default CancelRegistration;
