import { useEffect, useState } from "react";
import {
	getSprints,
	createSprint,
	updateSprint,
	deleteSprint,
	getTasks,
} from "@/lib/data";
import { capitalize, formatDate } from "@/lib/utils";
import type { Sprint, Task } from "@/types";
import { Plus, Trash2, X, Pencil, Zap } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
	planning: "bg-yellow-100 text-yellow-700",
	active: "bg-green-100 text-green-700",
	completed: "bg-gray-100 text-gray-700",
};

export function Sprints() {
	const [sprints, setSprints] = useState<Sprint[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Sprint | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const load = () => {
		Promise.all([getSprints(), getTasks()])
			.then(([s, t]) => {
				setSprints(s);
				setTasks(t);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this sprint?")) return;
		await deleteSprint(id);
		load();
	};

	const sprintTasks = (sprintId: string) =>
		tasks.filter((t) => t.sprint_id === sprintId);

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
					<h1 className="text-2xl font-bold">Sprints</h1>
					<p className="text-muted-foreground text-sm">
						Plan and track work in focused iterations
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Sprint
				</button>
			</div>

			{showForm && (
				<SprintForm
					sprint={editing}
					hasActiveSprint={sprints.some(
						(s) => s.status === "active" && s.id !== editing?.id,
					)}
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

			<div className="space-y-3">
				{sprints.map((sprint) => {
					const sTasks = sprintTasks(sprint.id);
					const done = sTasks.filter((t) => t.status === "done").length;
					const total = sTasks.length;

					return (
						<div
							key={sprint.id}
							className="border border-border rounded-lg group"
						>
							<div className="p-4">
								<div className="flex items-start justify-between">
									<button
										onClick={() =>
											setExpandedId(
												expandedId === sprint.id ? null : sprint.id,
											)
										}
										className="text-left flex-1"
									>
										<div className="flex items-center gap-3">
											<Zap className="w-4 h-4 text-muted-foreground" />
											<h3 className="font-semibold text-sm">
												{sprint.name}
											</h3>
											<span
												className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[sprint.status]}`}
											>
												{sprint.status}
											</span>
										</div>
										<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 ml-7">
											<span>
												{formatDate(sprint.start_date)} →{" "}
												{formatDate(sprint.end_date)}
											</span>
											<span>&middot;</span>
											<span>
												{done}/{total} tasks done
											</span>
										</div>
										{sprint.goal && (
											<p className="text-sm text-muted-foreground mt-1 ml-7">
												Goal: {sprint.goal}
											</p>
										)}
									</button>
									<div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
										<button
											onClick={() => {
												setEditing(sprint);
												setShowForm(true);
											}}
											className="p-1.5 rounded hover:bg-accent"
										>
											<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
										<button
											onClick={() => handleDelete(sprint.id)}
											className="p-1.5 rounded hover:bg-accent"
										>
											<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
									</div>
								</div>
								{total > 0 && (
									<div className="mt-2 ml-7">
										<div className="w-full bg-muted rounded-full h-1.5">
											<div
												className="bg-green-500 h-1.5 rounded-full transition-all"
												style={{
													width: `${total > 0 ? (done / total) * 100 : 0}%`,
												}}
											/>
										</div>
									</div>
								)}
							</div>

							{expandedId === sprint.id && (
								<div className="border-t border-border p-4">
									<h4 className="text-sm font-semibold mb-2">
										Sprint Tasks
									</h4>
									{sTasks.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											No tasks assigned to this sprint. Assign tasks from
											the Tasks page.
										</p>
									) : (
										<div className="space-y-1.5">
											{sTasks.map((task) => (
												<div
													key={task.id}
													className="flex items-center justify-between text-sm p-2 rounded border border-border"
												>
													<div className="flex items-center gap-2">
														<StatusDot status={task.status} />
														<span
															className={
																task.status === "done"
																	? "line-through text-muted-foreground"
																	: ""
															}
														>
															{task.title}
														</span>
													</div>
													<span className="text-xs text-muted-foreground">
														{capitalize(task.assigned_to)}
													</span>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{sprints.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No sprints yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Create your first sprint
					</button>
				</div>
			)}
		</div>
	);
}

function StatusDot({ status }: { status: string }) {
	const colors: Record<string, string> = {
		todo: "bg-gray-400",
		"in-progress": "bg-blue-500",
		done: "bg-green-500",
	};
	return <div className={`w-2 h-2 rounded-full ${colors[status] || ""}`} />;
}

function SprintForm({
	sprint,
	hasActiveSprint,
	onSave,
	onCancel,
}: {
	sprint: Sprint | null;
	hasActiveSprint: boolean;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(sprint?.name || "");
	const [startDate, setStartDate] = useState(sprint?.start_date || "");
	const [endDate, setEndDate] = useState(sprint?.end_date || "");
	const [goal, setGoal] = useState(sprint?.goal || "");
	const [status, setStatus] = useState<string>(
		sprint?.status || "planning",
	);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const payload = {
			name,
			start_date: startDate,
			end_date: endDate,
			goal,
			status: status as Sprint["status"],
		};
		if (sprint) {
			await updateSprint(sprint.id, payload);
		} else {
			await createSprint(payload);
		}
		onSave();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="border border-border rounded-lg p-4 mb-4 space-y-3"
		>
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">
					{sprint ? "Edit Sprint" : "New Sprint"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Sprint name"
				required
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<div className="flex gap-3">
				<div className="flex-1">
					<label className="text-xs text-muted-foreground">Start</label>
					<input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						required
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					/>
				</div>
				<div className="flex-1">
					<label className="text-xs text-muted-foreground">End</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						required
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					/>
				</div>
			</div>
			<textarea
				value={goal}
				onChange={(e) => setGoal(e.target.value)}
				placeholder="Sprint goal (what are we trying to achieve?)"
				rows={2}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
			/>
			<select
				value={status}
				onChange={(e) => setStatus(e.target.value)}
				className="px-3 py-2 border border-input rounded-md text-sm bg-background"
			>
				<option value="planning">Planning</option>
				<option
					value="active"
					disabled={hasActiveSprint && status !== "active"}
				>
					Active{hasActiveSprint && status !== "active" ? " (one already active)" : ""}
				</option>
				<option value="completed">Completed</option>
			</select>
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
					disabled={saving || !name || !startDate || !endDate}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : sprint ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}
