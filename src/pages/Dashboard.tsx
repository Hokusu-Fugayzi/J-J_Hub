import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
	getProjects,
	getTasks,
	getNotes,
	getMoods,
	setMood,
	getDeals,
	getNewsPosts,
} from "@/lib/data";
import { capitalize, timeAgo, getGreeting, toDateString, formatCurrency } from "@/lib/utils";
import type { Project, Task, Note, MoodStatus, Deal, NewsPost } from "@/types";
import {
	FolderKanban,
	CheckSquare,
	StickyNote,
	ArrowRight,
	Flame,
	DollarSign,
	Newspaper,
} from "lucide-react";

const MOOD_OPTIONS = [
	{ emoji: "\u{1F525}", label: "On fire" },
	{ emoji: "\u{1F4AA}", label: "Crushing it" },
	{ emoji: "\u{1F60E}", label: "Feeling good" },
	{ emoji: "\u{1F914}", label: "Thinking" },
	{ emoji: "\u{1F634}", label: "Tired" },
	{ emoji: "\u{1F612}", label: "Meh" },
];

interface ActivityItem {
	id: string;
	type: "task" | "deal" | "news";
	title: string;
	subtitle: string;
	time: string;
	icon: React.ElementType;
	emoji: string;
	href: string;
}

export function Dashboard() {
	const { user } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [notes, setNotes] = useState<Note[]>([]);
	const [moods, setMoods] = useState<MoodStatus[]>([]);
	const [deals, setDealsState] = useState<Deal[]>([]);
	const [news, setNews] = useState<NewsPost[]>([]);
	const [loading, setLoading] = useState(true);

	const today = toDateString(new Date());
	const { greeting, subtext } = getGreeting(user!);

	useEffect(() => {
		Promise.all([
			getProjects(),
			getTasks(),
			getNotes(),
			getMoods(today),
			getDeals(),
			getNewsPosts(),
		])
			.then(([p, t, n, m, d, nw]) => {
				setProjects(p);
				setTasks(t);
				setNotes(n);
				setMoods(m);
				setDealsState(d);
				setNews(nw);
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

	// Build "What's happening" feed from recent tasks, deals, news
	const activityFeed: ActivityItem[] = [
		...tasks.slice(0, 4).map((t): ActivityItem => ({
			id: `task-${t.id}`,
			type: "task",
			title: t.title,
			subtitle: `${capitalize(t.assigned_to)} - ${t.status}`,
			time: t.updated_at,
			icon: CheckSquare,
			emoji: t.status === "done" ? "\u2705" : t.status === "in-progress" ? "\u{1F3C3}" : "\u{1F4CB}",
			href: "/board",
		})),
		...deals.slice(0, 3).map((d): ActivityItem => ({
			id: `deal-${d.id}`,
			type: "deal",
			title: d.name,
			subtitle: `${capitalize(d.stage)} - ${formatCurrency(d.value)}`,
			time: d.updated_at,
			icon: DollarSign,
			emoji: d.stage === "won" ? "\u{1F389}" : d.stage === "lost" ? "\u{1F614}" : "\u{1F4B0}",
			href: "/deals",
		})),
		...news.slice(0, 3).map((n): ActivityItem => ({
			id: `news-${n.id}`,
			type: "news",
			title: n.title,
			subtitle: `by ${capitalize(n.author)}`,
			time: n.updated_at,
			icon: Newspaper,
			emoji: n.category === "idea" ? "\u{1F4A1}" : n.category === "announcement" ? "\u{1F4E3}" : "\u{1F4F0}",
			href: "/news",
		})),
	].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

	return (
		<div>
			{/* Big greeting */}
			<div className="mb-6">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight">{greeting} {"\u{1F44B}"}</h1>
				<p className="text-lg text-muted-foreground mt-1">{subtext}</p>
			</div>

			{/* Mood widget - prominent card */}
			<div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-border p-5 mb-6">
				<p className="text-base font-semibold mb-3">How are you feeling today?</p>
				<div className="flex flex-wrap gap-2 mb-4">
					{MOOD_OPTIONS.map((m) => (
						<button
							key={m.emoji}
							onClick={() => handleMood(m.emoji, m.label)}
							className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border transition-all ${
								myMood?.emoji === m.emoji
									? "bg-primary text-primary-foreground border-primary scale-105 shadow-sm"
									: "bg-background border-border hover:bg-accent hover:scale-105"
							}`}
						>
							<span className="text-lg">{m.emoji}</span>
							<span className="hidden sm:inline">{m.label}</span>
						</button>
					))}
				</div>
				<div className="flex flex-wrap gap-4 text-sm">
					{myMood && (
						<span className="bg-background/80 px-3 py-1 rounded-full">
							You: {myMood.emoji} {myMood.label}
						</span>
					)}
					{partnerMood ? (
						<span className="bg-background/80 px-3 py-1 rounded-full text-muted-foreground">
							{capitalize(partnerName)}: {partnerMood.emoji} {partnerMood.label}
						</span>
					) : (
						<span className="bg-background/80 px-3 py-1 rounded-full text-muted-foreground">
							{capitalize(partnerName)} hasn't checked in yet
						</span>
					)}
				</div>
			</div>

			{/* Stat cards with emoji */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
				<StatCard
					emoji="\u{1F4C2}"
					icon={FolderKanban}
					label="Active Projects"
					value={activeProjects.length}
					href="/projects"
				/>
				<StatCard
					emoji="\u{1F4DD}"
					icon={CheckSquare}
					label="Your Tasks"
					value={myTasks.length}
					href="/board"
				/>
				<StatCard
					emoji="\u{1F5D2}\uFE0F"
					icon={StickyNote}
					label="Notes"
					value={notes.length}
					href="/notes"
				/>
				<StatCard
					emoji="\u{1F525}"
					icon={Flame}
					label="Done This Week"
					value={tasksThisWeek}
					href="/board"
				/>
			</div>

			{/* What's Happening + Recent Notes side by side */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* What's happening feed */}
				<div>
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold">What's Happening</h2>
					</div>
					<div className="space-y-2">
						{activityFeed.length > 0 ? (
							activityFeed.map((item) => (
								<Link
									key={item.id}
									to={item.href}
									className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<span className="text-xl flex-shrink-0">{item.emoji}</span>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium truncate">{item.title}</p>
										<p className="text-xs text-muted-foreground">{item.subtitle}</p>
									</div>
									<span className="text-xs text-muted-foreground flex-shrink-0">
										{timeAgo(item.time)}
									</span>
								</Link>
							))
						) : (
							<p className="text-sm text-muted-foreground py-4 text-center">
								Nothing yet -- go make some moves!
							</p>
						)}
					</div>
				</div>

				{/* Recent notes */}
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
								className="p-3 border border-border rounded-lg"
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
	emoji,
	label,
	value,
	href,
}: {
	emoji: string;
	icon: React.ElementType;
	label: string;
	value: number;
	href: string;
}) {
	return (
		<Link
			to={href}
			className="flex flex-col gap-1 p-4 border border-border rounded-xl hover:bg-accent/50 transition-all hover:scale-[1.02]"
		>
			<span className="text-2xl">{emoji}</span>
			<p className="text-2xl font-bold">{value}</p>
			<p className="text-xs text-muted-foreground">{label}</p>
		</Link>
	);
}

