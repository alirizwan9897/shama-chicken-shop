import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiBaseUrl } from "../lib/apiUrl";
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
        `${getApiBaseUrl()}/api/users/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );
      // Get user from either response.data.user or response.data
      const userData = response.data.user || response.data;
      login(userData);//update context
      // Save logged-in user
      localStorage.setItem(
        'shama-chicken-shop-auth',
        JSON.stringify(userData)
      );
      router.push('/');
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.response ? "Invalid email or password" : "Unable to reach the server")
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