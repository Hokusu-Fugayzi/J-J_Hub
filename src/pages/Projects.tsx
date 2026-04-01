import { useEffect, useState } from "react";
import {
	getProjects,
	createProject,
	updateProject,
	deleteProject,
	getTasks,
} from "@/lib/data";
import { capitalize, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Project, Task } from "@/types";
import { Plus, Pencil, Trash2, X, Lock } from "lucide-react";

export function Projects() {
	const { user } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Project | null>(null);

	const load = () => {
		Promise.all([getProjects(), getTasks()])
			.then(([p, t]) => {
				setProjects(p);
				setTasks(t);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	// Hide other user's personal projects
	const visibleProjects = projects.filter(
		(p) => !p.personal || p.assigned_to === user || p.assigned_to === "both",
	);

	const taskCountFor = (projectId: string) =>
		tasks.filter(
			(t) => t.project_id === projectId && t.status !== "done",
		).length;

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this project?")) return;
		await deleteProject(id);
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
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">Projects</h1>
					<p className="text-muted-foreground text-sm">
						Manage your businesses and initiatives
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Project
				</button>
			</div>

			{showForm && (
				<ProjectForm
					project={editing}
					currentUser={user!}
					onSave={() => {
						setShowForm(false);
						setEditing(null);
						load();
					}}
					onCancel={() => {
						setShowForm(false);
						setEditing(null);
					}}
				/>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{visibleProjects.map((project) => (
					<div
						key={project.id}
						className="border border-border rounded-lg p-4"
					>
						<div className="flex items-start justify-between mb-2">
							<div>
								<h3 className="font-semibold">{project.name}</h3>
								<p className="text-sm text-muted-foreground">
									{project.description || "No description"}
								</p>
							</div>
							<div className="flex gap-1">
								<button
									onClick={() => {
										setEditing(project);
										setShowForm(true);
									}}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
								<button
									onClick={() => handleDelete(project.id)}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
							</div>
						</div>
						<div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
							<StatusBadge status={project.status} />
							{project.personal && (
								<span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
									<Lock className="w-3 h-3" /> Personal
								</span>
							)}
							<span>{capitalize(project.assigned_to)}</span>
							<span>{taskCountFor(project.id)} open tasks</span>
							<span>{timeAgo(project.updated_at)}</span>
						</div>
					</div>
				))}
			</div>

			{projects.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No projects yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Create your first project
					</button>
				</div>
			)}
		</div>
	);
}

function ProjectForm({
	project,
	currentUser,
	onSave,
	onCancel,
}: {
	project: Project | null;
	currentUser: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(project?.name || "");
	const [description, setDescription] = useState(project?.description || "");
	const [status, setStatus] = useState<string>(project?.status || "active");
	const [assignedTo, setAssignedTo] = useState<string>(
		project?.assigned_to || currentUser,
	);
	const [personal, setPersonal] = useState(project?.personal ?? false);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		if (project) {
			await updateProject(project.id, {
				name,
				description,
				status: status as Project["status"],
				assigned_to: assignedTo as Project["assigned_to"],
				personal,
			});
		} else {
			await createProject({
				name,
				description,
				status: status as Project["status"],
				assigned_to: assignedTo as Project["assigned_to"],
				personal,
			});
		}
		onSave();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="border border-border rounded-lg p-4 mb-6 space-y-3"
		>
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">
					{project ? "Edit Project" : "New Project"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Project name"
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
			<div className="grid grid-cols-2 gap-3">
				<select
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="active">Active</option>
					<option value="paused">Paused</option>
					<option value="completed">Completed</option>
				</select>
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
			<label className="flex items-center gap-2 cursor-pointer">
				<button
					type="button"
					onClick={() => setPersonal(!personal)}
					className={`w-9 h-5 rounded-full transition-colors relative ${
						personal ? "bg-purple-500" : "bg-gray-300"
					}`}
				>
					<span
						className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
							personal ? "translate-x-4" : ""
						}`}
					/>
				</button>
				<span className="text-sm flex items-center gap-1.5">
					<Lock className="w-3.5 h-3.5 text-muted-foreground" />
					Personal — only visible to {assignedTo === "both" ? "you" : assignedTo}
				</span>
			</label>
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
					disabled={saving || !name}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : project ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		paused: "bg-yellow-100 text-yellow-700",
		completed: "bg-muted text-muted-foreground",
	};
	return (
		<span
			className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || ""}`}
		>
			{status}
		</span>
	);
}
