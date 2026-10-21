import { useEffect, useState } from "react"
import { useRouter } from "next/router";
import axios from "axios"
import { getApiBaseUrl } from "../lib/apiUrl";
export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  useEffect(() => {
    if (typeof router.query.phone === "string") {
      setFormData((previous) => ({ ...previous, phone: router.query.phone }));
    }
  }, [router.query.phone]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Complete form Data", formData)
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/api/users/create`, formData
      );
      const next = typeof router.query.next === "string" ? router.query.next : "";
      router.push({ pathname: "/signin", query: next ? { next } : {} });
    }
    catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Unable to create your account. Please try again."
      );
    }
  };
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <input type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input type="text"
          name="phone"
          placeholder="Phone Number" maxLength="10"
          value={formData.phone}
          onChange={handleChange}
        />
        <input type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
