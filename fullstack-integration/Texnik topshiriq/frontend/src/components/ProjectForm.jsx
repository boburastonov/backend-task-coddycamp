export default function ProjectForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium">Project title</label>
        <input
          className="field"
          name="title"
          onChange={onChange}
          placeholder="CRM redesign sprint"
          required
          value={values.title}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          className="field min-h-28"
          name="description"
          onChange={onChange}
          placeholder="Goals, context and delivery notes"
          value={values.description}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Status</label>
        <select className="field" name="status" onChange={onChange} value={values.status}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : isEditing ? "Update project" : "Create project"}
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
