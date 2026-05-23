import Task from "../models/Task.js";
import Project from "../models/Project.js";

function getPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listProjects(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
      Project.find({ owner: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments({ owner: req.user.id }),
    ]);

    res.json({
      items,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const project = await Project.create({
      title,
      description,
      status,
      owner: req.user.id,
    });

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const updates = Object.fromEntries(
      Object.entries({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
      }).filter(([, value]) => value !== undefined),
    );

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true },
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: project._id, owner: req.user.id });
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
}
