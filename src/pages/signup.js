import { useState } from "react"
import { useRouter } from "next/router";
import axios from "axios"
export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Complete form Data", formData)
    try {
      const response = await axios.post("http://localhost:4000/api/users/signup", formData);
      console.log('user created ', response.data)
      router.push("/signin");
    }
    catch (error) {
      console.log('user not created', error)
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
