import { useState, useEffect } from "react";
import Layout from "../components/Layout";

function Profile() {
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  // Load user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Please login first");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setFormName(data.name || "");
          setFormEmail(data.email || "");
        } else {
          setMessage(data.message || "Failed to load profile");
        }
      } catch (err) {
        setMessage("Failed to connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login first");
        setSaving(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formName, email: formEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setMessage("Profile updated successfully!");
        setEditing(false);
      } else {
        setMessage(data.message || "Failed to update profile");
      }
    } catch (err) {
      setMessage("Failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormName(user?.name || "");
    setFormEmail(user?.email || "");
    setEditing(false);
    setMessage("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-card">
        {/* Success/Error message */}
        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "5px",
              backgroundColor: message.includes("success")
                ? "#d1fae5"
                : "#fee2e2",
              color: message.includes("success") ? "#065f46" : "#991b1b",
            }}
          >
            {message}
          </div>
        )}

        {editing ? (
          // Edit mode
          <>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleCancel}
                className="btn btn-outline"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        ) : (
          // View mode
          <>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <p style={{ fontSize: "16px", color: "#1f2937" }}>{user?.name}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <p style={{ fontSize: "16px", color: "#1f2937" }}>
                {user?.email}
              </p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Profile;
