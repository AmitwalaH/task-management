import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Projects() {
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load projects");
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
  }, []);

  // Open modal for creating new project
  const handleCreate = () => {
    setEditingProject(null);
    setFormName("");
    setFormDescription("");
    setShowModal(true);
  };

  // Open modal for editing project
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormName(project.name);
    setFormDescription(project.description || "");
    setShowModal(true);
  };

  // Save project (create or update)
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let response;

      if (editingProject) {
        // Update existing project
        response = await fetch(`http://localhost:5000/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formName,
            description: formDescription,
          }),
        });
      } else {
        // Create new project
        response = await fetch("http://localhost:5000/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formName,
            description: formDescription,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project");
      }

      const savedProject = await response.json();

      // Update local state
      if (editingProject) {
        setProjects(
          projects.map((p) =>
            p.id === editingProject.id ? savedProject : p
          )
        );
      } else {
        setProjects([...projects, savedProject]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving project:", err);
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      // //
    }
  };

  // Navigate to project tasks
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

      {/* Projects Grid */}
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
            <div key={project.id} className="project-card">
              <div
                onClick={() => handleViewTasks(project.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-description">{project.description}</div>
                <div className="project-date">Created: {project.createdAt}</div>
              </div>
              <div className="project-actions">
                <button
                  onClick={() => handleEdit(project)}
                  className="btn btn-outline btn-small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
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