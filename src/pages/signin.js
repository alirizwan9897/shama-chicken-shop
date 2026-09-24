import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
export default function Signin() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://shama-chicken-shop.vercel.app',
        {
          email: formData.email,
          password: formData.password
        }
      );
      console.log('Login successful:', response.data);
      alert("Login Successfull:", response.data)
      // Get user from either response.data.user or response.data
      const userData = response.data.user || response.data;
      console.log('User data:', userData);
      login(userData);//update context
      // Save logged-in user
      localStorage.setItem(
        'shama-chicken-shop-auth',
        JSON.stringify(userData)
      );
      router.push('/');
    } catch (error) {
      console.log("Login failed");
      console.log("Status:", error.response?.status);
      console.log("Backend Error:", error.response?.data);
      alert(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}