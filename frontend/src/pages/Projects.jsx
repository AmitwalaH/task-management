// src/pages/Projects.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load projects");
        }

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);

  const handleCreate = () => {
    setEditingProject(null);
    setFormName("");
    setFormDescription("");
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormName(project.name || "");
    setFormDescription(project.description || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      let response;

      if (editingProject) {
        response = await fetch(
          `/api/projects/${editingProject._id || editingProject.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: formName,
              description: formDescription,
            }),
          },
        );
      } else {
        response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formName,
            description: formDescription,
          }),
        });
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project");
      }

      const savedProject = await response.json();

      if (editingProject) {
        setProjects(
          projects.map((p) =>
            (p._id || p.id) === (editingProject._id || editingProject.id)
              ? savedProject
              : p,
          ),
        );
      } else {
        setProjects([...projects, savedProject]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save project: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects(projects.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  const handleViewTasks = (projectId) => {
    navigate(`/projects/${projectId}/tasks`);
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
        <h1 className="page-title">Projects</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p className="empty-state-text">No projects yet</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id || project.id} className="project-card">
              <div
                onClick={() => handleViewTasks(project._id || project.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-description">{project.description}</div>
                <div className="project-date">
                  Created:{" "}
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div className="project-actions">
                <button
                  onClick={() => handleEdit(project)}
                  className="btn btn-outline btn-small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id || project.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingProject ? "Edit Project" : "Create Project"}
            </h2>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter project name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Enter project description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                {editingProject ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Projects;
