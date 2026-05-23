import { useEffect, useState } from "react";

import ProjectForm from "../components/ProjectForm.jsx";
import TaskForm from "../components/TaskForm.jsx";
import api from "../lib/api.js";

const emptyProjectForm = {
  title: "",
  description: "",
  status: "planned",
};

const emptyTaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  project: "",
};

function getMessage(error) {
  return error.response?.data?.message || "Unexpected error. Please try again.";
}

function formatDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Date(value).toLocaleDateString();
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectMeta, setProjectMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [taskMeta, setTaskMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);
  const [projectSaving, setProjectSaving] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects(1);
    loadTasks(1);
  }, []);

  useEffect(() => {
    if (projects.length && !taskForm.project && !editingTaskId) {
      setTaskForm((currentTaskForm) => ({
        ...currentTaskForm,
        project: projects[0]._id,
      }));
    }

    if (!projects.length && taskForm.project) {
      setTaskForm((currentTaskForm) => ({
        ...currentTaskForm,
        project: "",
      }));
    }
  }, [projects, editingTaskId, taskForm.project]);

  async function loadProjects(page = projectMeta.page) {
    try {
      setProjectLoading(true);
      const response = await api.get("/projects", {
        params: { page, limit: 6 },
      });
      setProjects(response.data.items);
      setProjectMeta({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (loadError) {
      setError(getMessage(loadError));
    } finally {
      setProjectLoading(false);
    }
  }

  async function loadTasks(page = taskMeta.page) {
    try {
      setTaskLoading(true);
      const response = await api.get("/tasks", {
        params: { page, limit: 8 },
      });
      setTasks(response.data.items);
      setTaskMeta({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (loadError) {
      setError(getMessage(loadError));
    } finally {
      setTaskLoading(false);
    }
  }

  async function handleProjectSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setProjectSaving(true);
      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, projectForm);
      } else {
        await api.post("/projects", projectForm);
      }

      setProjectForm(emptyProjectForm);
      setEditingProjectId(null);
      await loadProjects(1);
      await loadTasks(1);
    } catch (submitError) {
      setError(getMessage(submitError));
    } finally {
      setProjectSaving(false);
    }
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    setError("");

    if (!taskForm.project) {
      setError("Task yaratish uchun avval project yarating.");
      return;
    }

    const payload = {
      ...taskForm,
      dueDate: taskForm.dueDate || null,
    };

    try {
      setTaskSaving(true);
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setTaskForm({
        ...emptyTaskForm,
        project: projects[0]?._id || "",
      });
      setEditingTaskId(null);
      await loadTasks(1);
      await loadProjects(projectMeta.page);
    } catch (submitError) {
      setError(getMessage(submitError));
    } finally {
      setTaskSaving(false);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!window.confirm("Delete this project and all related tasks?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/projects/${projectId}`);
      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setProjectForm(emptyProjectForm);
      }
      if (taskForm.project === projectId) {
        setEditingTaskId(null);
        setTaskForm(emptyTaskForm);
      }
      await loadProjects(1);
      await loadTasks(1);
    } catch (deleteError) {
      setError(getMessage(deleteError));
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/tasks/${taskId}`);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setTaskForm({
          ...emptyTaskForm,
          project: projects[0]?._id || "",
        });
      }
      await loadTasks(1);
    } catch (deleteError) {
      setError(getMessage(deleteError));
    }
  }

  function beginProjectEdit(project) {
    setEditingProjectId(project._id);
    setProjectForm({
      title: project.title,
      description: project.description || "",
      status: project.status,
    });
  }

  function beginTaskEdit(task) {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      project: task.project?._id || "",
    });
  }

  const completedTaskCount = tasks.filter((task) => task.status === "done").length;
  const activeProjectCount = projects.filter((project) => project.status === "active").length;
  const urgentTaskCount = tasks.filter((task) => task.priority === "high").length;

  return (
    <main className="space-y-6 py-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Active projects</p>
          <h2 className="mt-2 text-4xl">{activeProjectCount}</h2>
        </article>
        <article className="panel px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Completed tasks</p>
          <h2 className="mt-2 text-4xl">{completedTaskCount}</h2>
        </article>
        <article className="panel px-5 py-4">
          <p className="text-sm text-[var(--muted)]">High priority now</p>
          <h2 className="mt-2 text-4xl">{urgentTaskCount}</h2>
        </article>
      </section>

      {error ? (
        <section className="rounded-[1.4rem] border border-[rgba(185,56,54,0.15)] bg-[rgba(185,56,54,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <article className="panel px-5 py-5 md:px-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                  Resource 1
                </p>
                <h2 className="mt-2 text-2xl">Projects</h2>
              </div>
              <span className="tag">{projectMeta.total} total</span>
            </div>

            <ProjectForm
              isEditing={Boolean(editingProjectId)}
              isSubmitting={projectSaving}
              onCancel={() => {
                setEditingProjectId(null);
                setProjectForm(emptyProjectForm);
              }}
              onChange={(event) => {
                const { name, value } = event.target;
                setProjectForm((current) => ({ ...current, [name]: value }));
              }}
              onSubmit={handleProjectSubmit}
              values={projectForm}
            />
          </article>

          <article className="panel px-5 py-5 md:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl">Project list</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary px-4 py-2"
                  disabled={projectMeta.page <= 1}
                  onClick={() => loadProjects(projectMeta.page - 1)}
                  type="button"
                >
                  Prev
                </button>
                <button
                  className="btn btn-secondary px-4 py-2"
                  disabled={projectMeta.page >= projectMeta.totalPages}
                  onClick={() => loadProjects(projectMeta.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            {projectLoading ? (
              <p className="text-sm text-[var(--muted)]">Projects loading...</p>
            ) : projects.length ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <article className="panel-strong p-4" key={project._id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h4 className="text-lg">{project.title}</h4>
                        <p className="max-w-xl text-sm text-[var(--muted)]">
                          {project.description || "No description yet."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="tag">{project.status}</span>
                          <span className="tag">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary px-4 py-2"
                          onClick={() => beginProjectEdit(project)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger px-4 py-2"
                          onClick={() => handleDeleteProject(project._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No projects yet. Create your first project to unlock task CRUD.
              </p>
            )}
          </article>
        </div>

        <div className="space-y-6">
          <article className="panel px-5 py-5 md:px-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                  Resource 2
                </p>
                <h2 className="mt-2 text-2xl">Tasks</h2>
              </div>
              <span className="tag">{taskMeta.total} total</span>
            </div>

            <TaskForm
              isEditing={Boolean(editingTaskId)}
              isSubmitting={taskSaving}
              onCancel={() => {
                setEditingTaskId(null);
                setTaskForm({
                  ...emptyTaskForm,
                  project: projects[0]?._id || "",
                });
              }}
              onChange={(event) => {
                const { name, value } = event.target;
                setTaskForm((current) => ({ ...current, [name]: value }));
              }}
              onSubmit={handleTaskSubmit}
              projects={projects}
              values={taskForm}
            />
          </article>

          <article className="panel px-5 py-5 md:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl">Task list</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary px-4 py-2"
                  disabled={taskMeta.page <= 1}
                  onClick={() => loadTasks(taskMeta.page - 1)}
                  type="button"
                >
                  Prev
                </button>
                <button
                  className="btn btn-secondary px-4 py-2"
                  disabled={taskMeta.page >= taskMeta.totalPages}
                  onClick={() => loadTasks(taskMeta.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            {taskLoading ? (
              <p className="text-sm text-[var(--muted)]">Tasks loading...</p>
            ) : tasks.length ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <article className="panel-strong p-4" key={task._id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg">{task.title}</h4>
                          <span className="tag">{task.priority}</span>
                          <span className="tag">{task.status}</span>
                        </div>
                        <p className="max-w-xl text-sm text-[var(--muted)]">
                          {task.description || "No description yet."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="tag">
                            Project: {task.project?.title || "Unknown"}
                          </span>
                          <span className="tag">Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary px-4 py-2"
                          onClick={() => beginTaskEdit(task)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger px-4 py-2"
                          onClick={() => handleDeleteTask(task._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                No tasks yet. Create a project first, then attach tasks to it.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
