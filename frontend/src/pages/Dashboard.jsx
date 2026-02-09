import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const API = import.meta.env.VITE_API_URL;

        if (!API) {
          throw new Error(
            "VITE_API_URL is missing. Add it in Vercel env vars and redeploy.",
          );
        }

        const projectsRes = await fetch(`${API}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const tasksRes = await fetch(`${API}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (projectsRes.status === 401 || tasksRes.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!projectsRes.ok || !tasksRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const projectsData = await projectsRes.json();
        const tasksData = await tasksRes.json();

        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Calculate task statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

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
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-number">{todoTasks}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inProgressTasks}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{doneTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Projects</h2>
          <Link to="/projects" className="btn btn-primary btn-small">
            View All
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No projects yet</p>
            <Link to="/projects" className="btn btn-primary">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project._id || project.id}
                to={`/projects/${project._id || project.id}/tasks`}
                style={{ textDecoration: "none" }}
              >
                <div className="project-card">
                  <div className="project-name">{project.name}</div>
                  <div className="project-description">
                    {project.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
