import React, { useState } from 'react';
import { useRouter } from "next/router";
import axios from "axios";
import { getApiBaseUrl } from "../lib/apiUrl";
export default function MobileSignup() {
  const [phone, setPhone] = useState('');
  const [loginform, setLoginForm] = useState(true);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const [generatedOtp, setGeneratedOtp] = useState("");
  const handlePhoneChange = (e) => {
    // Remove everything except numbers
    const value = e.target.value.replace(/\D/g, "");
    // Allow maximum 10 digits
    setPhone(value.slice(0, 10));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    // Handle form submission logic here
    let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit OTP
    console.log('Phone number submitted:', phone);
    console.log('Generated OTP:', otp);
    setGeneratedOtp(otp);
    setLoginForm(false); // Switch to OTP form after phone number submission  
  }
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (String(otp).trim() === String(generatedOtp).trim()) {
      try {
        const response = await axios.get(
          `${getApiBaseUrl()}/api/users/by-phone/${phone}`
        );
        const next = typeof router.query.next === "string" ? router.query.next : "";
        const nextQuery = next ? { next } : {};
        if (response.data.exists) {
          router.push({ pathname: "/signin", query: nextQuery });
        } else {
          router.push({ pathname: "/signup", query: { ...nextQuery, phone } });
        }
      } catch (error) {
        alert(
          error.response?.data?.error ||
          "Unable to verify this phone number. Please try again."
        );
      }
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };
  return (
    <div className="auth-container">
      {loginform && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Log in or signup</h1>
          <input type="text" placeholder="Phone Number" maxLength="10" value={phone} onChange={handlePhoneChange} />
          <button type="submit">Continue</button>
        </form>
      )}
      {!loginform && (
        <form className="auth-form" onSubmit={verifyOtp}>
          <h1>Enter OTP</h1>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit">Verify</button>
        </form>
      )}
    </div>
  );
}

