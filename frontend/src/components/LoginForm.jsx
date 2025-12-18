import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(username, password);
      navigate("/analytics");   // ⭐ redirect after login
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}