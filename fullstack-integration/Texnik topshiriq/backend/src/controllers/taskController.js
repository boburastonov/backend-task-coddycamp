import Project from "../models/Project.js";
import Task from "../models/Task.js";

function getPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

async function ensureProjectOwnership(projectId, ownerId) {
  return Project.findOne({ _id: projectId, owner: ownerId });
}

export async function listTasks(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filters = { owner: req.user.id };

    if (req.query.project) {
      filters.project = req.query.project;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Task.find(filters)
        .populate("project", "title status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filters),
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

export async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).populate("project", "title status");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    if (!title || !project) {
      return res
        .status(400)
        .json({ message: "Task title and project are required" });
    }

    const ownedProject = await ensureProjectOwnership(project, req.user.id);
    if (!ownedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      owner: req.user.id,
    });

    const populatedTask = await task.populate("project", "title status");
    return res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    if (req.body.project) {
      const ownedProject = await ensureProjectOwnership(req.body.project, req.user.id);
      if (!ownedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
    }

    const updates = Object.fromEntries(
      Object.entries({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        project: req.body.project,
      }).filter(([, value]) => value !== undefined),
    );

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true },
    ).populate("project", "title status");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
}
