import { IoMdMail } from "react-icons/io";
import { FaMap, FaPhone } from "react-icons/fa6";
import React, { useState } from "react";
import './Contact.css';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted data:", formData);
    // send data to backend / API here
    try {
      const res = await fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/mail/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // send exactly name, email, message
      });

      if (!res.ok) throw new Error("Failed to send message");

      const result = await res.json();
      console.log("Message sent:", result);
      alert("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" }); // reset form
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main>
        <section className="contact-section">
            {/* LEFT SIDE - Contact Details */}
            <div className="contact-details-container">
                <h2>Contact Info</h2>
                <div className="detail-item">
                    <IoMdMail style={{ color:"orange" }} />
                    <a style={{ color: 'orange' }} className="email-link" href='mailto:wgpedm@gmail.com'><span>awgpedm@gmail.com</span></a>
                </div>
                <div className="detail-item">
                    <IoMdMail style={{ color:"orange" }} />
                    <a style={{ color: 'orange' }} className="email-link" href='mailto:wgpedm@gmail.com'><span>info@gpedmonton.org</span></a>
                </div>
                <div className="detail-item">
                    <FaPhone style={{ color:"orange" }} />
                    <span>+ 1 (780) 438-1234</span>
                </div>
                <div className="detail-item">
                    <FaMap style={{ color:"orange" }} />
                    <span>Pragya Kunj<br></br>22037, Township Road 520 <br></br> Sherwood Park AB, T8E 1E9</span>
                </div>
                <div className="detail-item">
                    <FaMap style={{ color:"orange" }} />
                    <span>237 Ferguson Place,<br></br>Edmonton, AB, T6R 2C7</span>
                </div>
            </div>
            <div className="contact-form-container">
                <form onSubmit={handleSubmit} className="contact-form">
                    <h2>Contact Us</h2>
                    <div className="form-row">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="textbox"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="textbox"
                        />
                    </div>
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        className="textbox"
                    />
                    <div className="submit-button-wrapper">
                        <button type="submit" className="submit-button">Send Message</button>
                    </div>
                </form>
            </div>
        </section>
        {/* <section className="committee-section">
            <h2>Executive Committee Contact</h2>
            <p>Gayatri Pariwar Edmonton Executive committe for 2025:</p>
            <div>
                {committeeMembers.map((member, idx) => (
                    <ContactCard key={idx} {...member} />
                ))}
            </div>    
        </section> */}
    </main>
  );
};

export default Contact;