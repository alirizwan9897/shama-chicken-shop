import React, { useState } from 'react';
import { useRouter } from "next/router";
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
  const verifyOtp = (e) => {
    e.preventDefault();
    // Handle OTP verification logic here
    console.log("Entered OTP:", otp);
    console.log("Correct OTP:", generatedOtp);
    if (String(otp).trim() === String(generatedOtp).trim()) {
      alert("OTP verified successfully.");
      router.push("/signup"); // Redirect to signup page after successful OTP verification
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };
  return (
    <div className="auth-container">
      {loginform && (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Log in or signup</h1>
          <input type="text" placeholder="Phone Number" maxLength="10" onChange={handlePhoneChange} />
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

