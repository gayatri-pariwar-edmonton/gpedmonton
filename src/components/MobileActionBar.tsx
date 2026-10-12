import React from "react";
import { CalendarDays, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./MobileActionBar.css";

const DONATION_URL = "https://checkout.square.site/merchant/MLB04Z81ZPQQK/checkout/YFROZOMGZRKFLKH3CSH3KTL4";

const MobileActionBar: React.FC = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-action-bar" aria-label="Quick actions">
      <Link className="mobile-action-button events-action" to="/events">
        <CalendarDays aria-hidden="true" size={20} />
        <span>Upcoming Events</span>
        <small>Register</small>
      </Link>
      <a
        className="mobile-action-button donate-action"
        href={DONATION_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Heart aria-hidden="true" size={20} />
        <span>Donate</span>
        <small>Secure payment</small>
      </a>
    </nav>
  );
};

export default MobileActionBar;
