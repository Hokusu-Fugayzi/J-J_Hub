import { useEffect, useState } from "react";
import {
	getTasks,
	createTask,
	updateTask,
	deleteTask,
	getProjects,
} from "@/lib/data";
import { capitalize, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Task, Project } from "@/types";
import { Plus, Trash2, X, Circle, Loader2, CheckCircle2 } from "lucide-react";

const STATUS_CYCLE: Task["status"][] = ["todo", "in-progress", "done"];

export function Tasks() {
	const { user } = useAuth();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [filterAssigned, setFilterAssigned] = useState<string>("all");

	const load = () => {
		Promise.all([getTasks(), getProjects()])
			.then(([t, p]) => {
				setTasks(t);
				setProjects(p);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const cycleStatus = async (task: Task) => {
		const idx = STATUS_CYCLE.indexOf(task.status);
		const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
		await updateTask(task.id, { status: next });
		load();
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this task?")) return;
		await deleteTask(id);
		load();
	};

	const filtered = tasks.filter((t) => {
		if (filterStatus !== "all" && t.status !== filterStatus) return false;
		if (
			filterAssigned !== "all" &&
			t.assigned_to !== filterAssigned &&
			t.assigned_to !== "both"
		)
			return false;
		return true;
	});

	const projectName = (id: string | null) =>
		id ? projects.find((p) => p.id === id)?.name || "Unknown" : null;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground">
				Loading...
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">Tasks</h1>
					<p className="text-muted-foreground text-sm">
						Track what needs to get done
					</p>
				</div>
				<button
					onClick={() => setShowForm(true)}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Task
				</button>
			</div>

			<div className="flex gap-2 mb-4">
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					className="px-3 py-1.5 border border-input rounded-md text-sm bg-background"
				>
					<option value="all">All statuses</option>
					<option value="todo">To Do</option>
					<option value="in-progress">In Progress</option>
					<option value="done">Done</option>
				</select>
				<select
					value={filterAssigned}
					onChange={(e) => setFilterAssigned(e.target.value)}
					className="px-3 py-1.5 border border-input rounded-md text-sm bg-background"
				>
					<option value="all">Everyone</option>
					<option value="jonah">Jonah</option>
					<option value="julian">Julian</option>
				</select>
			</div>

			{showForm && (
				<TaskForm
					projects={projects}
					currentUser={user!}
					onSave={() => {
						setShowForm(false);
						load();
					}}
					onCancel={() => setShowForm(false)}
				/>
			)}

			<div className="space-y-2">
				{filtered.map((task) => (
					<div
						key={task.id}
						className="flex items-center gap-3 p-3 border border-border rounded-md group"
					>
						<button
							onClick={() => cycleStatus(task)}
							className="shrink-0"
							title={`Status: ${task.status} (click to cycle)`}
						>
							{task.status === "todo" && (
								<Circle className="w-5 h-5 text-muted-foreground" />
							)}
							{task.status === "in-progress" && (
								<Loader2 className="w-5 h-5 text-blue-500" />
							)}
							{task.status === "done" && (
								<CheckCircle2 className="w-5 h-5 text-green-500" />
							)}
						</button>
						<div className="flex-1 min-w-0">
							<p
								className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
							>
								{task.title}
							</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>{capitalize(task.assigned_to)}</span>
								{task.project_id && (
									<>
										<span>&middot;</span>
										<span>{projectName(task.project_id)}</span>
									</>
								)}
								<span>&middot;</span>
								<PriorityBadge priority={task.priority} />
								<span>&middot;</span>
								<span>{timeAgo(task.updated_at)}</span>
							</div>
						</div>
						<button
							onClick={() => handleDelete(task.id)}
							className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-opacity"
						>
							<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
						</button>
					</div>
				))}
			</div>

			{filtered.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<p>No tasks match your filters</p>
				</div>
			)}
		</div>
	);
}

function TaskForm({
	projects,
	currentUser,
	onSave,
	onCancel,
}: {
	projects: Project[];
	currentUser: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [projectId, setProjectId] = useState("");
	const [priority, setPriority] = useState("medium");
	const [assignedTo, setAssignedTo] = useState(currentUser);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		await createTask({
			title,
			description,
			project_id: projectId || null,
			status: "todo",
			priority: priority as Task["priority"],
			assigned_to: assignedTo as Task["assigned_to"],
			due_date: null,
		});
		onSave();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="border border-border rounded-lg p-4 mb-4 space-y-3"
		>
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">New Task</h3>
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
				rows={2}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
			/>
			<div className="flex gap-3">
				<select
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
					className="px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="">No project</option>
					{projects.map((p) => (
						<option key={p.id} value={p.id}>
							{p.name}
						</option>
					))}
				</select>
				<select
					value={priority}
					onChange={(e) => setPriority(e.target.value)}
					className="px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
				<select
					value={assignedTo}
					onChange={(e) => setAssignedTo(e.target.value)}
					className="px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="jonah">Jonah</option>
					<option value="julian">Julian</option>
					<option value="both">Both</option>
				</select>
			</div>
			<div className="flex gap-2 justify-end">
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1.5 text-sm rounded-md hover:bg-accent"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={saving || !title}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : "Create"}
				</button>
			</div>
		</form>
	);
}

function PriorityBadge({ priority }: { priority: string }) {
	const colors: Record<string, string> = {
		low: "text-muted-foreground",
		medium: "text-yellow-600",
		high: "text-red-600",
	};
	return <span className={colors[priority] || ""}>{priority}</span>;
}
