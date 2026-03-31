import { useEffect, useState } from "react";
import {
	getEvents,
	createEvent,
	updateEvent,
	deleteEvent,
	getTasks,
	getProjects,
} from "@/lib/data";
import {
	capitalize,
	getDaysInMonth,
	getFirstDayOfMonth,
	formatMonthYear,
	getWeekDates,
	toDateString,
} from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { CalendarEvent, Task, Project } from "@/types";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

const EVENT_COLORS: Record<string, string> = {
	blue: "bg-blue-500",
	green: "bg-green-500",
	purple: "bg-purple-500",
	orange: "bg-orange-500",
	red: "bg-red-500",
	pink: "bg-pink-500",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar() {
	const { user } = useAuth();
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState<"month" | "week">("month");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<CalendarEvent | null>(null);

	const load = () => {
		Promise.all([getEvents(), getTasks(), getProjects()])
			.then(([e, t, p]) => {
				setEvents(e);
				setTasks(t.filter((task) => task.due_date));
				setProjects(p);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const today = toDateString(new Date());

	const navigateMonth = (dir: number) => {
		const d = new Date(currentDate);
		d.setMonth(d.getMonth() + dir);
		setCurrentDate(d);
	};

	const navigateWeek = (dir: number) => {
		const d = new Date(currentDate);
		d.setDate(d.getDate() + 7 * dir);
		setCurrentDate(d);
	};

	const goToday = () => setCurrentDate(new Date());

	const eventsForDate = (dateStr: string) =>
		events.filter((e) => {
			if (e.end_date) {
				return dateStr >= e.date && dateStr <= e.end_date;
			}
			return e.date === dateStr;
		});

	const tasksForDate = (dateStr: string) =>
		tasks.filter((t) => t.due_date === dateStr);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this event?")) return;
		await deleteEvent(id);
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
					<h1 className="text-2xl font-bold">Calendar</h1>
					<p className="text-muted-foreground text-sm">
						Events, deadlines, and what's coming up
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setSelectedDate(today);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Event
				</button>
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
				<div className="flex items-center gap-2">
					<button
						onClick={() =>
							view === "month" ? navigateMonth(-1) : navigateWeek(-1)
						}
						className="p-2 rounded hover:bg-accent"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
					<h2 className="text-lg font-semibold min-w-[160px] text-center">
						{formatMonthYear(year, month)}
					</h2>
					<button
						onClick={() =>
							view === "month" ? navigateMonth(1) : navigateWeek(1)
						}
						className="p-2 rounded hover:bg-accent"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
					<button
						onClick={goToday}
						className="px-3 py-1.5 text-sm rounded-md hover:bg-accent border border-border ml-2"
					>
						Today
					</button>
				</div>
				<div className="flex gap-1">
					<button
						onClick={() => setView("month")}
						className={`px-3 py-1.5 rounded-md text-sm ${view === "month" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
					>
						Month
					</button>
					<button
						onClick={() => setView("week")}
						className={`px-3 py-1.5 rounded-md text-sm ${view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
					>
						Week
					</button>
				</div>
			</div>

			{showForm && (
				<EventForm
					event={editing}
					defaultDate={selectedDate || today}
					projects={projects}
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

			{view === "month" ? (
				<MonthView
					year={year}
					month={month}
					today={today}
					selectedDate={selectedDate}
					eventsForDate={eventsForDate}
					tasksForDate={tasksForDate}
					onSelectDate={(d) => setSelectedDate(d)}
				/>
			) : (
				<WeekView
					currentDate={currentDate}
					today={today}
					eventsForDate={eventsForDate}
					tasksForDate={tasksForDate}
					onSelectDate={(d) => setSelectedDate(d)}
				/>
			)}

			{selectedDate && (
				<DayDetail
					dateStr={selectedDate}
					events={eventsForDate(selectedDate)}
					tasks={tasksForDate(selectedDate)}
					onEdit={(e) => {
						setEditing(e);
						setShowForm(true);
					}}
					onDelete={handleDelete}
					onAddEvent={() => {
						setEditing(null);
						setShowForm(true);
					}}
				/>
			)}
		</div>
	);
}

function MonthView({
	year,
	month,
	today,
	selectedDate,
	eventsForDate,
	tasksForDate,
	onSelectDate,
}: {
	year: number;
	month: number;
	today: string;
	selectedDate: string | null;
	eventsForDate: (d: string) => CalendarEvent[];
	tasksForDate: (d: string) => Task[];
	onSelectDate: (d: string) => void;
}) {
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const cells: (number | null)[] = [];
	for (let i = 0; i < firstDay; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			<div className="grid grid-cols-7">
				{DAY_NAMES.map((d) => (
					<div
						key={d}
						className="p-2 text-xs font-medium text-muted-foreground text-center border-b border-border bg-muted/30"
					>
						{d}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7">
				{cells.map((day, i) => {
					if (day === null) {
						return (
							<div
								key={`empty-${i}`}
								className="min-h-[56px] md:min-h-[80px] border-b border-r border-border bg-muted/10"
							/>
						);
					}
					const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
					const dayEvents = eventsForDate(dateStr);
					const dayTasks = tasksForDate(dateStr);
					const isToday = dateStr === today;
					const isSelected = dateStr === selectedDate;

					return (
						<button
							key={dateStr}
							onClick={() => onSelectDate(dateStr)}
							className={`min-h-[56px] md:min-h-[80px] border-b border-r border-border p-1 md:p-1.5 text-left hover:bg-accent/30 transition-colors ${isSelected ? "bg-accent/50" : ""}`}
						>
							<span
								className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? "bg-primary text-primary-foreground" : ""}`}
							>
								{day}
							</span>
							<div className="mt-1 space-y-0.5">
								{dayEvents.slice(0, 3).map((ev) => (
									<div
										key={ev.id}
										className="flex items-center gap-1"
									>
										<div
											className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_COLORS[ev.color]}`}
										/>
										<span className="text-xs truncate">
											{ev.title}
										</span>
									</div>
								))}
								{dayTasks.slice(0, 2).map((t) => (
									<div
										key={t.id}
										className="flex items-center gap-1"
									>
										<div className="w-1.5 h-1.5 rounded-full shrink-0 bg-yellow-500" />
										<span className="text-xs truncate text-muted-foreground">
											{t.title}
										</span>
									</div>
								))}
								{dayEvents.length + dayTasks.length > 5 && (
									<span className="text-xs text-muted-foreground">
										+{dayEvents.length + dayTasks.length - 5} more
									</span>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function WeekView({
	currentDate,
	today,
	eventsForDate,
	tasksForDate,
	onSelectDate,
}: {
	currentDate: Date;
	today: string;
	eventsForDate: (d: string) => CalendarEvent[];
	tasksForDate: (d: string) => Task[];
	onSelectDate: (d: string) => void;
}) {
	const weekDates = getWeekDates(currentDate);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			<div className="grid grid-cols-7">
				{weekDates.map((date) => {
					const dateStr = toDateString(date);
					const isToday = dateStr === today;
					const dayEvents = eventsForDate(dateStr);
					const dayTasks = tasksForDate(dateStr);

					return (
						<button
							key={dateStr}
							onClick={() => onSelectDate(dateStr)}
							className="min-h-[120px] md:min-h-[200px] border-r border-border p-1.5 md:p-2 text-left hover:bg-accent/30 transition-colors last:border-r-0"
						>
							<div className="text-center mb-2">
								<div className="text-xs text-muted-foreground">
									{DAY_NAMES[date.getDay()]}
								</div>
								<div
									className={`text-lg font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full ${isToday ? "bg-primary text-primary-foreground" : ""}`}
								>
									{date.getDate()}
								</div>
							</div>
							<div className="space-y-1">
								{dayEvents.map((ev) => (
									<div
										key={ev.id}
										className={`text-xs p-1 rounded ${EVENT_COLORS[ev.color]} text-white truncate`}
									>
										{ev.start_time} {ev.title}
									</div>
								))}
								{dayTasks.map((t) => (
									<div
										key={t.id}
										className="text-xs p-1 rounded bg-yellow-100 text-yellow-800 truncate"
									>
										Due: {t.title}
									</div>
								))}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function DayDetail({
	dateStr,
	events,
	tasks,
	onEdit,
	onDelete,
	onAddEvent,
}: {
	dateStr: string;
	events: CalendarEvent[];
	tasks: Task[];
	onEdit: (e: CalendarEvent) => void;
	onDelete: (id: string) => void;
	onAddEvent: () => void;
}) {
	const d = new Date(dateStr + "T12:00:00");
	const label = d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="mt-4 border border-border rounded-lg p-4">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold">{label}</h3>
				<button
					onClick={onAddEvent}
					className="text-xs px-2 py-1 rounded hover:bg-accent"
				>
					+ Add Event
				</button>
			</div>
			{events.length === 0 && tasks.length === 0 && (
				<p className="text-sm text-muted-foreground">Nothing scheduled</p>
			)}
			<div className="space-y-2">
				{events.map((ev) => (
					<div
						key={ev.id}
						className="flex items-center justify-between p-2 rounded-md border border-border"
					>
						<div className="flex items-center gap-2">
							<div
								className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS[ev.color]}`}
							/>
							<div>
								<p className="text-sm font-medium">{ev.title}</p>
								<p className="text-xs text-muted-foreground">
									{ev.end_date
										? `${ev.date} → ${ev.end_date}`
										: `${ev.start_time} · ${ev.duration_minutes}min`}
									{" "}&middot; {capitalize(ev.assigned_to)} &middot; {ev.category}
								</p>
							</div>
						</div>
						<div className="flex gap-1">
							<button
								onClick={() => onEdit(ev)}
								className="p-1 rounded hover:bg-accent text-xs"
							>
								Edit
							</button>
							<button
								onClick={() => onDelete(ev.id)}
								className="p-1 rounded hover:bg-accent text-xs text-destructive"
							>
								Delete
							</button>
						</div>
					</div>
				))}
				{tasks.map((t) => (
					<div
						key={t.id}
						className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 border border-yellow-200"
					>
						<div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
						<div>
							<p className="text-sm font-medium">{t.title}</p>
							<p className="text-xs text-muted-foreground">
								Task due &middot; {capitalize(t.assigned_to)} &middot;{" "}
								{t.priority}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function EventForm({
	event,
	defaultDate,
	projects,
	currentUser,
	onSave,
	onCancel,
}: {
	event: CalendarEvent | null;
	defaultDate: string;
	projects: Project[];
	currentUser: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = useState(event?.title || "");
	const [description, setDescription] = useState(event?.description || "");
	const [date, setDate] = useState(event?.date || defaultDate);
	const [endDate, setEndDate] = useState(event?.end_date || "");
	const [startTime, setStartTime] = useState(event?.start_time || "09:00");
	const [duration, setDuration] = useState(
		String(event?.duration_minutes || 60),
	);
	const [assignedTo, setAssignedTo] = useState(
		event?.assigned_to || currentUser,
	);
	const [color, setColor] = useState<string>(event?.color || "blue");
	const [category, setCategory] = useState(event?.category || "meeting");
	const [projectId, setProjectId] = useState(event?.project_id || "");
	const [saving, setSaving] = useState(false);
	const isMultiDay = category === "travel" || !!endDate;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const payload = {
			title,
			description,
			date,
			end_date: endDate || null,
			start_time: isMultiDay ? "00:00" : startTime,
			duration_minutes: isMultiDay ? 0 : Number(duration),
			assigned_to: assignedTo as CalendarEvent["assigned_to"],
			color: color as CalendarEvent["color"],
			category: category as CalendarEvent["category"],
			project_id: projectId || null,
		};
		if (event) {
			await updateEvent(event.id, payload);
		} else {
			await createEvent(payload);
		}
		onSave();
	};

	const colorOptions = Object.keys(EVENT_COLORS) as string[];

	return (
		<form
			onSubmit={handleSubmit}
			className="border border-border rounded-lg p-4 mb-4 space-y-3"
		>
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">
					{event ? "Edit Event" : "New Event"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Event title"
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
				<div>
					<label className="text-xs text-muted-foreground">Start date</label>
					<input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					/>
				</div>
				<div>
					<label className="text-xs text-muted-foreground">End date (multi-day)</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						min={date}
						className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
					/>
				</div>
				{!isMultiDay && (
					<>
						<div>
							<label className="text-xs text-muted-foreground">Time</label>
							<input
								type="time"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
							/>
						</div>
						<div>
							<label className="text-xs text-muted-foreground">Duration</label>
							<select
								value={duration}
								onChange={(e) => setDuration(e.target.value)}
								className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
							>
								<option value="15">15 min</option>
								<option value="30">30 min</option>
								<option value="45">45 min</option>
								<option value="60">1 hour</option>
								<option value="90">1.5 hours</option>
								<option value="120">2 hours</option>
							</select>
						</div>
					</>
				)}
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as CalendarEvent["category"])}
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="meeting">Meeting</option>
					<option value="deadline">Deadline</option>
					<option value="reminder">Reminder</option>
					<option value="social">Social</option>
					<option value="travel">Travel</option>
					<option value="other">Other</option>
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
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Color:</span>
				{colorOptions.map((c) => (
					<button
						key={c}
						type="button"
						onClick={() => setColor(c)}
						className={`w-6 h-6 rounded-full ${EVENT_COLORS[c]} ${color === c ? "ring-2 ring-ring ring-offset-2" : ""}`}
					/>
				))}
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
					{saving ? "Saving..." : event ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}
