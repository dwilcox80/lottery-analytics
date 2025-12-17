// frontend/src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext.jsx";
import api from "../api/axios";

export default function ProfilePage() {
  const { user, access } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sync local form state if user changes (e.g., after initial fetch)
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!access) {
    return <div>You must be logged in to view your profile.</div>;
  }

  if (!user) {
    return <div>Loading profile…</div>;
  }

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await api.patch(
        "/auth/user/",
        { username, email },
      );
      // You might also want to update user in AuthContext here later
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Profile</h2>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Username:
          <input
            style={{ marginLeft: "0.5rem" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Email:
          <input
            style={{ marginLeft: "0.5rem" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleUpdate} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}