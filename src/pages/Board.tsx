import { useEffect, useState } from "react";
import {
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	getProjects,
	getSprints,
	ensurePersonalProject,
} from "@/lib/data";
import { capitalize } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Task, Project, Sprint } from "@/types";
import { Plus, X, Trash2 } from "lucide-react";

const COLUMNS: { status: Task["status"]; label: string; color: string }[] = [
	{ status: "todo", label: "To Do", color: "border-t-gray-400" },
	{ status: "in-progress", label: "In Progress", color: "border-t-blue-400" },
	{ status: "done", label: "Done", color: "border-t-green-400" },
];

const PROJECT_COLORS = [
	"border-l-blue-500 bg-blue-50/50",
	"border-l-green-500 bg-green-50/50",
	"border-l-purple-500 bg-purple-50/50",
	"border-l-orange-500 bg-orange-50/50",
	"border-l-pink-500 bg-pink-50/50",
	"border-l-teal-500 bg-teal-50/50",
	"border-l-red-500 bg-red-50/50",
	"border-l-yellow-500 bg-yellow-50/50",
	"border-l-indigo-500 bg-indigo-50/50",
	"border-l-cyan-500 bg-cyan-50/50",
];

const PROJECT_DOT_COLORS = [
	"bg-blue-500",
	"bg-green-500",
	"bg-purple-500",
	"bg-orange-500",
	"bg-pink-500",
	"bg-teal-500",
	"bg-red-500",
	"bg-yellow-500",
	"bg-indigo-500",
	"bg-cyan-500",
];

const priorityColors: Record<string, string> = {
	low: "bg-gray-100 text-gray-600",
	medium: "bg-yellow-100 text-yellow-700",
	high: "bg-red-100 text-red-700",
};

export function Board() {
	const { user } = useAuth();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [sprints, setSprints] = useState<Sprint[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterSprint, setFilterSprint] = useState<string>("all");
	const [filterProject, setFilterProject] = useState<string>("all");
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [addingTo, setAddingTo] = useState<Task["status"] | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [showAllDone, setShowAllDone] = useState(false);

	const load = async () => {
		await ensurePersonalProject(user!);
		Promise.all([getTasks(), getProjects(), getSprints()])
			.then(([t, p, s]) => {
				setTasks(t);
				setProjects(p);
				setSprints(s);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const projectColorMap = new Map<string, number>();
	projects.forEach((p, i) => {
		projectColorMap.set(p.id, i % PROJECT_COLORS.length);
	});

	const getProjectColor = (projectId: string | null) => {
		if (!projectId) return "border-l-gray-300";
		const idx = projectColorMap.get(projectId);
		return idx !== undefined ? PROJECT_COLORS[idx] : "border-l-gray-300";
	};

	const getProjectDot = (projectId: string | null) => {
		if (!projectId) return "bg-gray-300";
		const idx = projectColorMap.get(projectId);
		return idx !== undefined ? PROJECT_DOT_COLORS[idx] : "bg-gray-300";
	};

	const projectName = (id: string | null) => {
		if (!id) return null;
		const p = projects.find((p) => p.id === id);
		return p ? (p.personal ? `🔒 ${p.name}` : p.name) : null;
	};

	// Hide tasks that belong to someone else's personal project
	const personalProjectIds = new Set(
		projects
			.filter((p) => p.personal && p.assigned_to !== user && p.assigned_to !== "both")
			.map((p) => p.id),
	);

	const visibleProjects = projects.filter(
		(p) => !p.personal || p.assigned_to === user || p.assigned_to === "both",
	);

	const filtered = tasks.filter((t) => {
		// Hide tasks from other user's personal projects
		if (t.project_id && personalProjectIds.has(t.project_id)) return false;
		if (filterSprint !== "all") {
			if (filterSprint === "none" && t.sprint_id) return false;
			if (filterSprint !== "none" && t.sprint_id !== filterSprint) return false;
		}
		if (filterProject !== "all") {
			if (filterProject === "none" && t.project_id) return false;
			if (filterProject !== "none" && t.project_id !== filterProject) return false;
		}
		return true;
	});

	const handleDragStart = (taskId: string) => {
		setDraggedId(taskId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (status: Task["status"]) => {
		if (!draggedId) return;
		const task = tasks.find((t) => t.id === draggedId);
		if (task && task.status !== status) {
			await updateTask(draggedId, { status });
			load();
		}
		setDraggedId(null);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this task?")) return;
		await deleteTask(id);
		load();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground">
				Loading...
			</div>
		);
	}

	return (
		<div>
			<div className="mb-4">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h1 className="text-xl md:text-2xl font-bold">Board</h1>
						<p className="text-muted-foreground text-sm hidden sm:block">
							Drag tasks between columns
						</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<select
						value={filterProject}
						onChange={(e) => setFilterProject(e.target.value)}
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					>
						<option value="all">All projects</option>
						<option value="none">No project</option>
						{visibleProjects.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}{p.personal ? " (Personal)" : ""}
							</option>
						))}
					</select>
					<select
						value={filterSprint}
						onChange={(e) => setFilterSprint(e.target.value)}
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					>
						<option value="all">All sprints</option>
						<option value="none">No sprint</option>
						{sprints.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Project color legend */}
			{visibleProjects.length > 0 && (
				<div className="flex flex-wrap gap-3 mb-4 text-xs">
					{visibleProjects.map((p) => (
						<div key={p.id} className="flex items-center gap-1.5">
							<div
								className={`w-2.5 h-2.5 rounded-full ${getProjectDot(p.id)}`}
							/>
							<span className="text-muted-foreground">{p.name}</span>
						</div>
					))}
				</div>
			)}

			{/* Edit task modal */}
			{editingTask && (
				<EditTaskModal
					task={editingTask}
					projects={visibleProjects}
					sprints={sprints}
					onSave={() => {
						setEditingTask(null);
						load();
					}}
					onDelete={() => {
						handleDelete(editingTask.id);
						setEditingTask(null);
					}}
					onCancel={() => setEditingTask(null)}
				/>
			)}

			{/* Mobile: stacked columns. Desktop: 3-col grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 md:min-h-[500px]">
				{COLUMNS.map(({ status, label, color }) => {
					const columnTasks = filtered.filter((t) => t.status === status);
					const DONE_LIMIT = 10;
					const isDone = status === "done";
					const visibleTasks = isDone && !showAllDone
						? columnTasks.slice(0, DONE_LIMIT)
						: columnTasks;
					const hiddenCount = isDone ? columnTasks.length - DONE_LIMIT : 0;

					return (
						<div
							key={status}
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(status)}
							className={`rounded-lg border border-border border-t-4 ${color} p-3 overflow-hidden`}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-sm">{label}</h3>
									<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
										{columnTasks.length}
									</span>
								</div>
								<button
									onClick={() =>
										setAddingTo(addingTo === status ? null : status)
									}
									className="p-1 rounded hover:bg-accent"
									title="Add task"
								>
									<Plus className="w-4 h-4 text-muted-foreground" />
								</button>
							</div>

							{addingTo === status && (
								<QuickAddTask
									status={status}
									projects={visibleProjects}
									sprints={sprints}
									currentUser={user!}
									activeSprintFilter={filterSprint}
									activeProjectFilter={filterProject}
									onSave={() => {
										setAddingTo(null);
										load();
									}}
									onCancel={() => setAddingTo(null)}
								/>
							)}

							<div className="space-y-2">
								{visibleTasks.map((task) => (
									<div
										key={task.id}
										draggable
										onDragStart={() => handleDragStart(task.id)}
										onClick={() => setEditingTask(task)}
										className={`p-3 rounded-md border border-border border-l-4 cursor-pointer md:cursor-grab md:active:cursor-grabbing hover:shadow-sm transition-shadow group overflow-hidden ${getProjectColor(task.project_id)} ${draggedId === task.id ? "opacity-50" : ""}`}
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-medium break-words min-w-0">{task.title}</p>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(task.id);
												}}
												className="p-1.5 rounded md:opacity-0 md:group-hover:opacity-100 hover:bg-accent transition-opacity shrink-0"
											>
												<Trash2 className="w-3 h-3 text-muted-foreground" />
											</button>
										</div>
										<div className="flex items-center gap-2 mt-2">
											<span
												className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}
											>
												{task.priority}
											</span>
											<span className="text-xs text-muted-foreground">
												{capitalize(task.assigned_to)}
											</span>
										</div>
										{projectName(task.project_id) && (
											<div className="flex items-center gap-1.5 mt-1.5">
												<div
													className={`w-2 h-2 rounded-full ${getProjectDot(task.project_id)}`}
												/>
												<p className="text-xs text-muted-foreground">
													{projectName(task.project_id)}
												</p>
											</div>
										)}
									</div>
								))}
							</div>
							{isDone && hiddenCount > 0 && (
								<button
									onClick={() => setShowAllDone(!showAllDone)}
									className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
								>
									{showAllDone
										? "Show less"
										: `View ${hiddenCount} more completed`}
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function EditTaskModal({
	task,
	projects,
	sprints,
	onSave,
	onDelete,
	onCancel,
}: {
	task: Task;
	projects: Project[];
	sprints: Sprint[];
	onSave: () => void;
	onDelete: () => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const [status, setStatus] = useState<string>(task.status);
	const [priority, setPriority] = useState<string>(task.priority);
	const [assignedTo, setAssignedTo] = useState<string>(task.assigned_to);
	const [projectId, setProjectId] = useState(task.project_id || "");
	const [sprintId, setSprintId] = useState(task.sprint_id || "");
	const [dueDate, setDueDate] = useState(task.due_date || "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			await updateTask(task.id, {
				title,
				description,
				status: status as Task["status"],
				priority: priority as Task["priority"],
				assigned_to: assignedTo as Task["assigned_to"],
				project_id: projectId || null,
				sprint_id: sprintId || null,
				due_date: dueDate || null,
			});
			onSave();
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
			onClick={onCancel}
		>
			<form
				onClick={(e) => e.stopPropagation()}
				onSubmit={handleSubmit}
				className="bg-background border border-border rounded-lg p-4 md:p-5 w-full max-w-[92vw] sm:max-w-md space-y-3 shadow-lg max-h-[85vh] overflow-y-auto"
			>
				<div className="flex items-center justify-between">
					<h3 className="font-semibold">Edit Task</h3>
					<button type="button" onClick={onCancel} className="p-1">
						<X className="w-4 h-4" />
					</button>
				</div>
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Task title"
					required
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description (optional)"
					rows={3}
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
				/>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="text-xs text-muted-foreground">Status</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						>
							<option value="todo">To Do</option>
							<option value="in-progress">In Progress</option>
							<option value="done">Done</option>
						</select>
					</div>
					<div>
						<label className="text-xs text-muted-foreground">Priority</label>
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="text-xs text-muted-foreground">Assigned to</label>
						<select
							value={assignedTo}
							onChange={(e) => setAssignedTo(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						>
							<option value="jonah">Jonah</option>
							<option value="julian">Julian</option>
							<option value="both">Both</option>
						</select>
					</div>
					<div>
						<label className="text-xs text-muted-foreground">Due date</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						/>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="text-xs text-muted-foreground">Project</label>
						<select
							value={projectId}
							onChange={(e) => setProjectId(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						>
							<option value="">No project</option>
							{projects.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-xs text-muted-foreground">Sprint</label>
						<select
							value={sprintId}
							onChange={(e) => setSprintId(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
						>
							<option value="">No sprint</option>
							{sprints.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="flex items-center justify-between pt-2">
					<button
						type="button"
						onClick={onDelete}
						className="text-xs text-destructive hover:underline"
					>
						Delete task
					</button>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={onCancel}
							className="px-3 py-1.5 text-sm rounded-md hover:bg-accent"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={saving || !title.trim()}
							className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
						>
							{saving ? "Saving..." : "Save"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

function QuickAddTask({
	status,
	projects,
	sprints,
	currentUser,
	activeSprintFilter,
	activeProjectFilter,
	onSave,
	onCancel,
}: {
	status: Task["status"];
	projects: Project[];
	sprints: Sprint[];
	currentUser: string;
	activeSprintFilter: string;
	activeProjectFilter: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const defaultSprint = activeSprintFilter !== "all" && activeSprintFilter !== "none" ? activeSprintFilter : "";
	const defaultProject = activeProjectFilter !== "all" && activeProjectFilter !== "none" ? activeProjectFilter : "";
	const [title, setTitle] = useState("");
	const [projectId, setProjectId] = useState(defaultProject);
	const [sprintId, setSprintId] = useState(defaultSprint);
	const [priority, setPriority] = useState("medium");
	const [assignedTo, setAssignedTo] = useState(currentUser);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		setSaving(true);
		try {
			await createTask({
				title: title.trim(),
				description: "",
				project_id: projectId || null,
				sprint_id: sprintId || null,
				status,
				priority: priority as Task["priority"],
				assigned_to: assignedTo as Task["assigned_to"],
				due_date: null,
			});
			onSave();
		} finally {
			setSaving(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="border border-border rounded-md p-2.5 mb-2 space-y-2 bg-background"
		>
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium text-muted-foreground">
					New task
				</span>
				<button type="button" onClick={onCancel} className="p-0.5">
					<X className="w-3.5 h-3.5" />
				</button>
			</div>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Task title"
				autoFocus
				required
				className="w-full px-2 py-1.5 border border-input rounded text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
			/>
			<div className="grid grid-cols-2 gap-2">
				<select
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
					className="w-full px-2 py-1.5 border border-input rounded text-xs bg-background"
				>
					<option value="">No project</option>
					{projects.map((p) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
				</select>
				<select
					value={sprintId}
					onChange={(e) => setSprintId(e.target.value)}
					className="w-full px-2 py-1.5 border border-input rounded text-xs bg-background"
				>
					<option value="">No sprint</option>
					{sprints.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>
				<select
					value={priority}
					onChange={(e) => setPriority(e.target.value)}
					className="w-full px-2 py-1.5 border border-input rounded text-xs bg-background"
				>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
				<select
					value={assignedTo}
					onChange={(e) => setAssignedTo(e.target.value)}
					className="w-full px-2 py-1.5 border border-input rounded text-xs bg-background"
				>
					<option value="jonah">Jonah</option>
					<option value="julian">Julian</option>
					<option value="both">Both</option>
				</select>
			</div>
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={saving || !title.trim()}
					className="px-2.5 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "..." : "Add"}
				</button>
			</div>
		</form>
	);
}
