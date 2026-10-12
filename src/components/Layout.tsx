import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MobileActionBar from "./MobileActionBar";


const Layout: React.FC = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const loadRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  

  useEffect(() => {
    if (location.pathname.includes("/register")) {
      setShowNavbar(false);
      return;
    }

    if (location.pathname !== '/') {
      // Any page except Home → show navbar
      setShowNavbar(true);
      return;
    }

    // Home page → use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => setShowNavbar(!entries[0].isIntersecting),
      { threshold: 0.1 }
    );

    if (loadRef.current) observer.observe(loadRef.current);

    return () => {
      if (loadRef.current) observer.unobserve(loadRef.current);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isRegisterOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; // optional, just in case
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isRegisterOpen]);

  return (
    <>
      <Navbar 
        className={showNavbar ? 'show' : ''}
        // onDonateClick={() => setIsDonateOpen(true)} /* Placeholder for other buttons of registration */
      />
      <Outlet context={{ setIsRegisterOpen, loadRef }} />
      <MobileActionBar />
    </>
  );
};

export default Layout;
