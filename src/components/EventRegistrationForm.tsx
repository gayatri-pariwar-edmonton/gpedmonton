import React, { useState } from "react";
import { useForm } from "react-hook-form";
import './EventRegistrationForm.css'
import squareLogo from '../assets/images/square-logo.png'
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  attendees: number;
  specialRequests?: string;
  agree: boolean;
}

interface LocationState {
  eventName?: string;
  date?: string;
  desc?: string;
}

const EventRegistrationForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { eventName: eventNameFromParams } = useParams<{ eventName: string }>();

  const location = useLocation();
  const state = location.state as LocationState;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  
  const onSubmit = async (data: FormData) => {
    const eventName = state?.eventName || eventNameFromParams || "Unknown Event";

    try {
      setSubmitting(true);
      setSubmitMessage("");
      const saveRes = await fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          eventName: state?.eventName || eventNameFromParams || "Unknown Event",
        }),
      });

      if (saveRes.status === 409) {
        setSubmitMessage("You have already registered for this event.");
        return;
      }
      if (!saveRes.ok) {
        const failure = await saveRes.json().catch(() => ({})) as { message?: string };
        throw new Error(failure.message || "Failed to submit registration");
      }

      const result = await saveRes.json();
      console.log("Registration saved:", result);

      // const registrationId = result.registration._id;

      // const mailRes = await fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/mail/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: data.email,
      //     date: state?.date,
      //     name: `${data.firstName} ${data.lastName}`,
      //     eventName: state?.eventName,
      //     attendees: data.attendees,
      //     phoneNumber: data.phone,
      //     specialRequests: data.specialRequests,
      //     registrationId,
      //   }),
      // });

      // if (!mailRes.ok) throw new Error("Failed to send confirmation email.");
      // console.log("Confirmation email sent.");

      setSubmitMessage(`Registration successful for ${eventName}!`);
      window.setTimeout(() => navigate("/events"), 1200);
    } catch (err) {
      console.error("Error submitting registration:", err);
      setSubmitMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="event-registration-page">
      <div className="event-info">
        <h1>{state?.eventName || eventNameFromParams}</h1>
        <h3>{state?.date}</h3>
        <ReactMarkdown>{state?.desc || "No description provided."}</ReactMarkdown>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="form-container">
        <h2 className="form-title">
          {"Event Registration"}
        </h2>

        <label>Your name</label>
          <input placeholder="First" {...register("firstName", { required: "First Name is required" })} />
          {errors.firstName && <p className="error">{errors.firstName.message}</p>}
          <input placeholder="Last" {...register("lastName", { required: "Last Name is required" })} />
          {errors.lastName && <p className="error">{errors.lastName.message}</p>}

          <label>Email</label>
          <input placeholder="Email Address" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }})} />
          {errors.email && <p className="error">{errors.email.message}</p>}

          <label>Phone (optional)</label>
          <input type="tel" autoComplete="tel" {...register("phone")} />

        {/* Attendees */}
        <label>Number of Attendees</label>
        <input type="number" min={1} defaultValue={1} {...register("attendees", { required: true, min: 1 })} />

        {/* Special Requests */}
        <label>Special Requests</label>
        <textarea {...register("specialRequests")} />

        {/* Donation */}
        <div className="donation-link">
          <label>Donate (optional)</label>
          <a href="https://checkout.square.site/merchant/MLB04Z81ZPQQK/checkout/YFROZOMGZRKFLKH3CSH3KTL4" target="_blank" rel="noopener noreferrer">
            <img src={squareLogo} className='square-up-logo' />
          </a>
        </div>

        {/* Agreement */}
        <div className="terms-group">
          <input
            className="terms-checkbox"
            type="checkbox"
            {...register("agree", { required: "You must agree before submitting" })}
          />
          <span>I agree to the <Link to="/privacy">Terms & Conditions</Link></span>
        </div>
        {errors.agree && <p className="error">{errors.agree.message}</p>}

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Registering…" : "Register"}
        </button>
        {submitMessage && <p className="submit-message" role="status">{submitMessage}</p>}
      </form>
    </main>
  );
};

export default EventRegistrationForm;
