const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

// GET /api/projects - Get all projects for logged in user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/projects/:id - Get single project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/projects - Create new project
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = new Project({
      title,
      description,
      owner: req.userId,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, description },
      { new: true }, // Return updated document
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/projects/:id - Delete project and its tasks
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Also delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
