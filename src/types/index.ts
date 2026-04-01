export type User = "jonah" | "julian";

export interface Project {
	id: string;
	name: string;
	description: string;
	status: "active" | "paused" | "completed";
	assigned_to: User | "both";
	created_at: string;
	updated_at: string;
}

export interface Task {
	id: string;
	project_id: string | null;
	sprint_id: string | null;
	title: string;
	description: string;
	status: "todo" | "in-progress" | "done";
	priority: "low" | "medium" | "high";
	assigned_to: User | "both";
	due_date: string | null;
	created_at: string;
	updated_at: string;
}

export interface Note {
	id: string;
	project_id: string | null;
	title: string;
	content: string;
	created_by: User;
	created_at: string;
	updated_at: string;
}

// ── Calendar ──

export interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	date: string;
	end_date: string | null;
	start_time: string;
	duration_minutes: number;
	assigned_to: User | "both";
	color: "blue" | "green" | "purple" | "orange" | "red" | "pink";
	category: "meeting" | "deadline" | "reminder" | "social" | "travel" | "other";
	project_id: string | null;
	created_at: string;
	updated_at: string;
}

// ── Scrum ──

export interface Sprint {
	id: string;
	name: string;
	start_date: string;
	end_date: string;
	goal: string;
	status: "planning" | "active" | "completed";
	created_at: string;
	updated_at: string;
}

export interface StandupEntry {
	id: string;
	user: User;
	date: string;
	did: string;
	doing: string;
	blockers: string;
	created_at: string;
}

// ── CRM ──

export interface Contact {
	id: string;
	name: string;
	email: string;
	phone: string;
	company: string;
	notes: string;
	tags: string[];
	created_at: string;
	updated_at: string;
}

export interface Deal {
	id: string;
	name: string;
	value: number;
	stage: "lead" | "proposal" | "negotiation" | "won" | "lost";
	contact_id: string | null;
	project_id: string | null;
	notes: string;
	created_at: string;
	updated_at: string;
}

export interface ContactActivity {
	id: string;
	contact_id: string;
	type: "call" | "email" | "meeting" | "note";
	description: string;
	date: string;
	created_by: User;
	created_at: string;
}

// ── News ──

export interface NewsPost {
	id: string;
	title: string;
	content: string;
	author: User;
	category: "announcement" | "update" | "idea" | "link";
	pinned: boolean;
	url: string | null;
	created_at: string;
	updated_at: string;
}

// ── Fitness ──

export interface WorkoutRoutine {
	user: User;
	day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
	name: string;
	focus: string;
	exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
	name: string;
	sets: number;
	reps: string;
	rest: string;
	notes?: string;
}

export interface WorkoutLog {
	id: string;
	user: User;
	date: string;
	routine_day: string;
	exercises_completed: string[];
	duration_minutes: number;
	energy_level: 1 | 2 | 3 | 4 | 5;
	notes: string;
	created_at: string;
}

export interface WaterLog {
	id: string;
	user: User;
	date: string;
	glasses: number;
	goal: number;
	created_at: string;
}

export interface DailyCheckIn {
	id: string;
	user: User;
	date: string;
	weight: number | null;
	sleep_hours: number | null;
	soreness: 1 | 2 | 3 | 4 | 5 | null;
	worked_out: boolean;
	hit_water_goal: boolean;
	alcohol: boolean;
	notes: string;
	created_at: string;
}

export interface WeighIn {
	id: string;
	user: User;
	date: string;
	weight: number;
	created_at: string;
}

// ── Fun ──

export interface MoodStatus {
	id: string;
	user: User;
	emoji: string;
	label: string;
	date: string;
	created_at: string;
}
