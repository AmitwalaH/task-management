const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();


router.use(auth);

// GET /api/tasks/stats/all
router.get("/stats/all", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks - Get all tasks for logged in user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks/project/:projectId - Get tasks for a specific project
router.get("/project/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ project: req.params.projectId }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    console.error("Get project tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks/:id - Get single task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "project",
      "title owner",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/tasks - Create new task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId } =
      req.body;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = new Task({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate,
      project: projectId,
      assignedTo: req.userId,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/tasks/:id - Update task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id).populate(
      "project",
      "owner",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.title = title || task.title;
    task.description =
      description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "project",
      "owner",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
