import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
	getProjects,
	getTasks,
	getNotes,
	getMoods,
	setMood,
} from "@/lib/data";
import { capitalize, timeAgo, getGreeting, toDateString } from "@/lib/utils";
import type { Project, Task, Note, MoodStatus } from "@/types";
import {
	FolderKanban,
	CheckSquare,
	StickyNote,
	ArrowRight,
	Flame,
} from "lucide-react";

const MOOD_OPTIONS = [
	{ emoji: "\u{1F525}", label: "On fire" },
	{ emoji: "\u{1F4AA}", label: "Crushing it" },
	{ emoji: "\u{1F60E}", label: "Feeling good" },
	{ emoji: "\u{1F914}", label: "Thinking" },
	{ emoji: "\u{1F634}", label: "Tired" },
	{ emoji: "\u{1F612}", label: "Meh" },
];

export function Dashboard() {
	const { user } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [notes, setNotes] = useState<Note[]>([]);
	const [moods, setMoods] = useState<MoodStatus[]>([]);
	const [loading, setLoading] = useState(true);

	const today = toDateString(new Date());
	const { greeting, subtext } = getGreeting(user!);

	useEffect(() => {
		Promise.all([getProjects(), getTasks(), getNotes(), getMoods(today)])
			.then(([p, t, n, m]) => {
				setProjects(p);
				setTasks(t);
				setNotes(n);
				setMoods(m);
			})
			.finally(() => setLoading(false));
	}, []);

	const handleMood = async (emoji: string, label: string) => {
		await setMood({ user: user!, emoji, label, date: today });
		getMoods(today).then(setMoods);
	};

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

	const myMood = moods.find((m) => m.user === user);
	const partnerName = user === "jonah" ? "julian" : "jonah";
	const partnerMood = moods.find((m) => m.user === partnerName);

	// Streak: consecutive days with at least one task completed
	const completedTasks = tasks
		.filter((t) => t.status === "done")
		.sort(
			(a, b) =>
				new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
		);
	const tasksThisWeek = completedTasks.filter((t) => {
		const diff =
			(new Date().getTime() - new Date(t.updated_at).getTime()) /
			(1000 * 60 * 60 * 24);
		return diff <= 7;
	}).length;

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{greeting}</h1>
				<p className="text-muted-foreground">{subtext}</p>
			</div>

			{/* Mood check */}
			<div className="border border-border rounded-lg p-4 mb-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium mb-2">How are you feeling?</p>
						<div className="flex gap-2">
							{MOOD_OPTIONS.map((m) => (
								<button
									key={m.emoji}
									onClick={() => handleMood(m.emoji, m.label)}
									className={`text-xl p-1.5 rounded-lg hover:bg-accent transition-colors ${myMood?.emoji === m.emoji ? "bg-accent ring-2 ring-primary" : ""}`}
									title={m.label}
								>
									{m.emoji}
								</button>
							))}
						</div>
					</div>
					<div className="text-right text-sm">
						{myMood && (
							<p>
								You: {myMood.emoji} {myMood.label}
							</p>
						)}
						{partnerMood ? (
							<p className="text-muted-foreground">
								{capitalize(partnerName)}: {partnerMood.emoji}{" "}
								{partnerMood.label}
							</p>
						) : (
							<p className="text-muted-foreground">
								{capitalize(partnerName)} hasn't checked in yet
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
				<StatCard
					icon={Flame}
					label="Done This Week"
					value={tasksThisWeek}
					href="/board"
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
