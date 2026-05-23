export default function TaskForm({
  values,
  projects,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium">Task title</label>
        <input
          className="field"
          name="title"
          onChange={onChange}
          placeholder="Prepare API collection"
          required
          value={values.title}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          className="field min-h-24"
          name="description"
          onChange={onChange}
          placeholder="Describe the expected result"
          value={values.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Project</label>
          <select
            className="field"
            disabled={!projects.length}
            name="project"
            onChange={onChange}
            required
            value={values.project}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Due date</label>
          <input
            className="field"
            name="dueDate"
            onChange={onChange}
            type="date"
            value={values.dueDate}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <select className="field" name="priority" onChange={onChange} value={values.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select className="field" name="status" onChange={onChange} value={values.status}>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : isEditing ? "Update task" : "Create task"}
        </button>
        {isEditing ? (
          <button className="btn btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
