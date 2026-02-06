import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";

function Tasks() {
  const { projectId } = useParams();

  // State
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("todo");
  const [formPriority, setFormPriority] = useState("medium");
  const [formDueDate, setFormDueDate] = useState("");

  // Load project and tasks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch project
        const projectRes = await fetch(
          `http://localhost:5000/api/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Fetch tasks
        const tasksRes = await fetch(
          `http://localhost:5000/api/tasks/project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!projectRes.ok || !tasksRes.ok) {
          throw new Error("Failed to load data");
        }

        const projectData = await projectRes.json();
        const tasksData = await tasksRes.json();

        setProject(projectData);
        setTasks(tasksData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Open modal for creating new task
  const handleCreate = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("todo");
    setFormPriority("medium");
    setFormDueDate("");
    setShowModal(true);
  };

  // Open modal for editing task
  const handleEdit = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate || "");
    setShowModal(true);
  };

  // Save task (create or update)
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let response;

      if (editingTask) {
        // Update existing task
        response = await fetch(
          `http://localhost:5000/api/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: formTitle,
              description: formDescription,
              status: formStatus,
              priority: formPriority,
              dueDate: formDueDate,
            }),
          },
        );
      } else {
        // Create new task
        response = await fetch("http://localhost:5000/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            status: formStatus,
            priority: formPriority,
            dueDate: formDueDate,
            projectId,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save task");
      }

      const updatedTask = await response.json();

      // Update local state
      if (editingTask) {
        setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      } else {
        setTasks([...tasks, updatedTask]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Get badge class for status
  const getStatusBadge = (status) => {
    switch (status) {
      case "todo":
        return "badge badge-todo";
      case "in-progress":
        return "badge badge-in-progress";
      case "done":
        return "badge badge-done";
      default:
        return "badge";
    }
  };

  // Get badge class for priority
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "low":
        return "badge badge-low";
      case "medium":
        return "badge badge-medium";
      case "high":
        return "badge badge-high";
      default:
        return "badge";
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status === "in-progress"
      ? "In Progress"
      : status.charAt(0).toUpperCase() + status.slice(1);
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
        <div>
          <Link to="/projects" style={{ fontSize: "14px" }}>
            ← Back to Projects
          </Link>
          <h1 className="page-title">{project?.name} - Tasks</h1>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          + New Task
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">No tasks in this project yet</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className="task-actions">
                  <button
                    onClick={() => handleEdit(task)}
                    className="btn btn-outline btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="task-description">{task.description}</div>
              <div className="task-meta">
                <span className={getStatusBadge(task.status)}>
                  {formatStatus(task.status)}
                </span>
                <span className={getPriorityBadge(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}{" "}
                  Priority
                </span>
                {task.dueDate && (
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>
                    Due: {task.dueDate}
                  </span>
                )}
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
              {editingTask ? "Edit Task" : "Create Task"}
            </h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="Enter task title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Enter task description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                className="form-select"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                className="form-input"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
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
                {editingTask ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tasks;
