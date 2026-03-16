import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getProjects, getTasks, getNotes } from "@/lib/data";
import { capitalize, timeAgo } from "@/lib/utils";
import type { Project, Task, Note } from "@/types";
import {
	FolderKanban,
	CheckSquare,
	StickyNote,
	ArrowRight,
} from "lucide-react";

export function Dashboard() {
	const { user } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([getProjects(), getTasks(), getNotes()])
			.then(([p, t, n]) => {
				setProjects(p);
				setTasks(t);
				setNotes(n);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground">
				Loading...
			</div>
		);
	}

	const activeProjects = projects.filter((p) => p.status === "active");
	const openTasks = tasks.filter((t) => t.status !== "done");
	const myTasks = openTasks.filter(
		(t) => t.assigned_to === user || t.assigned_to === "both",
	);

	return (
		<div>
			<h1 className="text-2xl font-bold mb-1">
				Hey {capitalize(user!)}, welcome back
			</h1>
			<p className="text-muted-foreground mb-6">
				Here's what's happening across your projects.
			</p>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<StatCard
					icon={FolderKanban}
					label="Active Projects"
					value={activeProjects.length}
					href="/projects"
				/>
				<StatCard
					icon={CheckSquare}
					label="Your Open Tasks"
					value={myTasks.length}
					href="/tasks"
				/>
				<StatCard
					icon={StickyNote}
					label="Total Notes"
					value={notes.length}
					href="/notes"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold">Recent Tasks</h2>
						<Link
							to="/tasks"
							className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
						>
							View all <ArrowRight className="w-3 h-3" />
						</Link>
					</div>
					<div className="space-y-2">
						{tasks.slice(0, 5).map((task) => (
							<div
								key={task.id}
								className="flex items-center justify-between p-3 border border-border rounded-md"
							>
								<div>
									<p className="text-sm font-medium">{task.title}</p>
									<p className="text-xs text-muted-foreground">
										{capitalize(task.assigned_to)} &middot;{" "}
										{timeAgo(task.updated_at)}
									</p>
								</div>
								<StatusBadge status={task.status} />
							</div>
						))}
						{tasks.length === 0 && (
							<p className="text-sm text-muted-foreground py-4 text-center">
								No tasks yet
							</p>
						)}
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold">Recent Notes</h2>
						<Link
							to="/notes"
							className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
						>
							View all <ArrowRight className="w-3 h-3" />
						</Link>
					</div>
					<div className="space-y-2">
						{notes.slice(0, 5).map((note) => (
							<div
								key={note.id}
								className="p-3 border border-border rounded-md"
							>
								<p className="text-sm font-medium">{note.title}</p>
								<p className="text-xs text-muted-foreground">
									{capitalize(note.created_by)} &middot;{" "}
									{timeAgo(note.updated_at)}
								</p>
							</div>
						))}
						{notes.length === 0 && (
							<p className="text-sm text-muted-foreground py-4 text-center">
								No notes yet
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: React.ElementType;
	label: string;
	value: number;
	href: string;
}) {
	return (
		<Link
			to={href}
			className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
		>
			<div className="p-2 bg-primary/10 rounded-md">
				<Icon className="w-5 h-5" />
			</div>
			<div>
				<p className="text-2xl font-bold">{value}</p>
				<p className="text-xs text-muted-foreground">{label}</p>
			</div>
		</Link>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		todo: "bg-muted text-muted-foreground",
		"in-progress": "bg-blue-100 text-blue-700",
		done: "bg-green-100 text-green-700",
	};
	return (
		<span
			className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || ""}`}
		>
			{status}
		</span>
	);
}
