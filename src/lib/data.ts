import { supabase, isSupabaseConfigured } from "./supabase";
import type {
	Project,
	Task,
	Note,
	User,
	CalendarEvent,
	Sprint,
	StandupEntry,
	Contact,
	Deal,
	ContactActivity,
	NewsPost,
	MoodStatus,
	WorkoutLog,
	WaterLog,
	DailyCheckIn,
	WeighIn,
	FitnessNudge,
} from "@/types";

// ── Projects ──

export async function ensurePersonalProject(user: User): Promise<void> {
	if (!isSupabaseConfigured) return;
	const { data } = await supabase!
		.from("projects")
		.select("id")
		.eq("personal", true)
		.eq("assigned_to", user)
		.limit(1);
	if (data && data.length > 0) return;
	await supabase!
		.from("projects")
		.insert({
			name: `${user.charAt(0).toUpperCase() + user.slice(1)}'s Personal`,
			description: "Private tasks — only visible to you",
			status: "active",
			assigned_to: user,
			personal: true,
		});
}

export async function getProjects(): Promise<Project[]> {
	if (isSupabaseConfigured) {
		const { data, error } = await supabase!
			.from("projects")
			.select("*")
			.order("updated_at", { ascending: false });
		if (error) throw error;
		return data as Project[];
	}
	return [];
}

export async function getProject(id: string): Promise<Project> {
	const { data, error } = await supabase!
		.from("projects")
		.select("*")
		.eq("id", id)
		.single();
	if (error) throw error;
	return data as Project;
}

export async function createProject(
	project: Omit<Project, "id" | "created_at" | "updated_at">,
): Promise<Project> {
	const { data, error } = await supabase!
		.from("projects")
		.insert(project)
		.select()
		.single();
	if (error) throw error;
	return data as Project;
}

export async function updateProject(
	id: string,
	updates: Partial<Project>,
): Promise<Project> {
	const { data, error } = await supabase!
		.from("projects")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
	const { error } = await supabase!.from("projects").delete().eq("id", id);
	if (error) throw error;
}

// ── Tasks ──

export async function getTasks(filters?: {
	project_id?: string;
	assigned_to?: User;
	status?: Task["status"];
	sprint_id?: string;
}): Promise<Task[]> {
	let query = supabase!
		.from("tasks")
		.select("*")
		.order("created_at", { ascending: false });
	if (filters?.project_id) query = query.eq("project_id", filters.project_id);
	if (filters?.assigned_to)
		query = query.or(
			`assigned_to.eq.${filters.assigned_to},assigned_to.eq.both`,
		);
	if (filters?.status) query = query.eq("status", filters.status);
	if (filters?.sprint_id) query = query.eq("sprint_id", filters.sprint_id);
	const { data, error } = await query;
	if (error) throw error;
	return data as Task[];
}

export async function createTask(
	task: Omit<Task, "id" | "created_at" | "updated_at">,
): Promise<Task> {
	const { data, error } = await supabase!
		.from("tasks")
		.insert(task)
		.select()
		.single();
	if (error) throw error;
	return data as Task;
}

export async function updateTask(
	id: string,
	updates: Partial<Task>,
): Promise<Task> {
	const { data, error } = await supabase!
		.from("tasks")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
	const { error } = await supabase!.from("tasks").delete().eq("id", id);
	if (error) throw error;
}

// ── Notes ──

export async function getNotes(filters?: {
	project_id?: string;
}): Promise<Note[]> {
	let query = supabase!
		.from("notes")
		.select("*")
		.order("updated_at", { ascending: false });
	if (filters?.project_id) query = query.eq("project_id", filters.project_id);
	const { data, error } = await query;
	if (error) throw error;
	return data as Note[];
}

export async function createNote(
	note: Omit<Note, "id" | "created_at" | "updated_at">,
): Promise<Note> {
	const { data, error } = await supabase!
		.from("notes")
		.insert(note)
		.select()
		.single();
	if (error) throw error;
	return data as Note;
}

export async function updateNote(
	id: string,
	updates: Partial<Note>,
): Promise<Note> {
	const { data, error } = await supabase!
		.from("notes")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
	const { error } = await supabase!.from("notes").delete().eq("id", id);
	if (error) throw error;
}

// ── Calendar Events ──

export async function getEvents(filters?: {
	date?: string;
	assigned_to?: User;
}): Promise<CalendarEvent[]> {
	let query = supabase!
		.from("events")
		.select("*")
		.order("date", { ascending: true });
	if (filters?.date) query = query.eq("date", filters.date);
	if (filters?.assigned_to)
		query = query.or(
			`assigned_to.eq.${filters.assigned_to},assigned_to.eq.both`,
		);
	const { data, error } = await query;
	if (error) throw error;
	return data as CalendarEvent[];
}

export async function createEvent(
	event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">,
): Promise<CalendarEvent> {
	const { data, error } = await supabase!
		.from("events")
		.insert(event)
		.select()
		.single();
	if (error) throw error;
	return data as CalendarEvent;
}

export async function updateEvent(
	id: string,
	updates: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
	const { data, error } = await supabase!
		.from("events")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as CalendarEvent;
}

export async function deleteEvent(id: string): Promise<void> {
	const { error } = await supabase!.from("events").delete().eq("id", id);
	if (error) throw error;
}

// ── Sprints ──

export async function getSprints(): Promise<Sprint[]> {
	const { data, error } = await supabase!
		.from("sprints")
		.select("*")
		.order("created_at", { ascending: false });
	if (error) throw error;
	return data as Sprint[];
}

export async function createSprint(
	sprint: Omit<Sprint, "id" | "created_at" | "updated_at">,
): Promise<Sprint> {
	const { data, error } = await supabase!
		.from("sprints")
		.insert(sprint)
		.select()
		.single();
	if (error) throw error;
	return data as Sprint;
}

export async function updateSprint(
	id: string,
	updates: Partial<Sprint>,
): Promise<Sprint> {
	const { data, error } = await supabase!
		.from("sprints")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Sprint;
}

export async function deleteSprint(id: string): Promise<void> {
	const { error } = await supabase!.from("sprints").delete().eq("id", id);
	if (error) throw error;
}

// ── Standups ──

export async function getStandups(filters?: {
	user?: User;
	date?: string;
}): Promise<StandupEntry[]> {
	let query = supabase!
		.from("standups")
		.select("*")
		.order("date", { ascending: false });
	if (filters?.user) query = query.eq("user", filters.user);
	if (filters?.date) query = query.eq("date", filters.date);
	const { data, error } = await query;
	if (error) throw error;
	return data as StandupEntry[];
}

export async function createStandup(
	standup: Omit<StandupEntry, "id" | "created_at">,
): Promise<StandupEntry> {
	const { data, error } = await supabase!
		.from("standups")
		.insert(standup)
		.select()
		.single();
	if (error) throw error;
	return data as StandupEntry;
}

export async function deleteStandup(id: string): Promise<void> {
	const { error } = await supabase!.from("standups").delete().eq("id", id);
	if (error) throw error;
}

// ── Contacts ──

export async function getContacts(filters?: {
	search?: string;
}): Promise<Contact[]> {
	let query = supabase!
		.from("contacts")
		.select("*")
		.order("updated_at", { ascending: false });
	if (filters?.search)
		query = query.or(
			`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
		);
	const { data, error } = await query;
	if (error) throw error;
	return data as Contact[];
}

export async function createContact(
	contact: Omit<Contact, "id" | "created_at" | "updated_at">,
): Promise<Contact> {
	const { data, error } = await supabase!
		.from("contacts")
		.insert(contact)
		.select()
		.single();
	if (error) throw error;
	return data as Contact;
}

export async function updateContact(
	id: string,
	updates: Partial<Contact>,
): Promise<Contact> {
	const { data, error } = await supabase!
		.from("contacts")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
	const { error } = await supabase!.from("contacts").delete().eq("id", id);
	if (error) throw error;
}

// ── Deals ──

export async function getDeals(filters?: {
	stage?: Deal["stage"];
	contact_id?: string;
}): Promise<Deal[]> {
	let query = supabase!
		.from("deals")
		.select("*")
		.order("updated_at", { ascending: false });
	if (filters?.stage) query = query.eq("stage", filters.stage);
	if (filters?.contact_id) query = query.eq("contact_id", filters.contact_id);
	const { data, error } = await query;
	if (error) throw error;
	return data as Deal[];
}

export async function createDeal(
	deal: Omit<Deal, "id" | "created_at" | "updated_at">,
): Promise<Deal> {
	const { data, error } = await supabase!
		.from("deals")
		.insert(deal)
		.select()
		.single();
	if (error) throw error;
	return data as Deal;
}

export async function updateDeal(
	id: string,
	updates: Partial<Deal>,
): Promise<Deal> {
	const { data, error } = await supabase!
		.from("deals")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Deal;
}

export async function deleteDeal(id: string): Promise<void> {
	const { error } = await supabase!.from("deals").delete().eq("id", id);
	if (error) throw error;
}

// ── Contact Activities ──

export async function getContactActivities(
	contactId: string,
): Promise<ContactActivity[]> {
	const { data, error } = await supabase!
		.from("contact_activities")
		.select("*")
		.eq("contact_id", contactId)
		.order("date", { ascending: false });
	if (error) throw error;
	return data as ContactActivity[];
}

export async function createContactActivity(
	activity: Omit<ContactActivity, "id" | "created_at">,
): Promise<ContactActivity> {
	const { data, error } = await supabase!
		.from("contact_activities")
		.insert(activity)
		.select()
		.single();
	if (error) throw error;
	return data as ContactActivity;
}

export async function deleteContactActivity(id: string): Promise<void> {
	const { error } = await supabase!
		.from("contact_activities")
		.delete()
		.eq("id", id);
	if (error) throw error;
}

// ── News Posts ──

export async function getNewsPosts(): Promise<NewsPost[]> {
	const { data, error } = await supabase!
		.from("news_posts")
		.select("*")
		.order("pinned", { ascending: false })
		.order("created_at", { ascending: false });
	if (error) throw error;
	return data as NewsPost[];
}

export async function createNewsPost(
	post: Omit<NewsPost, "id" | "created_at" | "updated_at">,
): Promise<NewsPost> {
	const { data, error } = await supabase!
		.from("news_posts")
		.insert(post)
		.select()
		.single();
	if (error) throw error;
	return data as NewsPost;
}

export async function updateNewsPost(
	id: string,
	updates: Partial<NewsPost>,
): Promise<NewsPost> {
	const { data, error } = await supabase!
		.from("news_posts")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as NewsPost;
}

export async function deleteNewsPost(id: string): Promise<void> {
	const { error } = await supabase!.from("news_posts").delete().eq("id", id);
	if (error) throw error;
}

// ── Mood Status ──

export async function getMoods(date?: string): Promise<MoodStatus[]> {
	let query = supabase!.from("moods").select("*");
	if (date) query = query.eq("date", date);
	const { data, error } = await query;
	if (error) throw error;
	return data as MoodStatus[];
}

export async function setMood(
	mood: Omit<MoodStatus, "id" | "created_at">,
): Promise<MoodStatus> {
	// Check if mood exists for this user+date
	const { data: existing } = await supabase!
		.from("moods")
		.select("id")
		.eq("user", mood.user)
		.eq("date", mood.date)
		.single();
	if (existing) {
		const { data, error } = await supabase!
			.from("moods")
			.update({ emoji: mood.emoji, label: mood.label })
			.eq("id", existing.id)
			.select()
			.single();
		if (error) throw error;
		return data as MoodStatus;
	}
	const { data, error } = await supabase!
		.from("moods")
		.insert(mood)
		.select()
		.single();
	if (error) throw error;
	return data as MoodStatus;
}

// ── Workout Logs ──

export async function getWorkoutLogs(filters?: {
	user?: User;
	date?: string;
}): Promise<WorkoutLog[]> {
	if (!isSupabaseConfigured) return [];
	let query = supabase!
		.from("workout_logs")
		.select("*")
		.order("date", { ascending: false });
	if (filters?.user) query = query.eq("user", filters.user);
	if (filters?.date) query = query.eq("date", filters.date);
	const { data, error } = await query;
	if (error) throw error;
	return data as WorkoutLog[];
}

export async function createWorkoutLog(
	log: Omit<WorkoutLog, "id" | "created_at">,
): Promise<WorkoutLog> {
	const { data, error } = await supabase!
		.from("workout_logs")
		.insert(log)
		.select()
		.single();
	if (error) throw error;
	return data as WorkoutLog;
}

export async function deleteWorkoutLog(id: string): Promise<void> {
	const { error } = await supabase!.from("workout_logs").delete().eq("id", id);
	if (error) throw error;
}

// ── Water Logs ──

export async function getWaterLog(
	user: User,
	date: string,
): Promise<WaterLog | null> {
	if (!isSupabaseConfigured) return null;
	const { data, error } = await supabase!
		.from("water_logs")
		.select("*")
		.eq("user", user)
		.eq("date", date)
		.maybeSingle();
	if (error) throw error;
	return data as WaterLog | null;
}

export async function upsertWaterLog(
	log: Omit<WaterLog, "id" | "created_at">,
): Promise<WaterLog> {
	const existing = await getWaterLog(log.user, log.date);
	if (existing) {
		const { data, error } = await supabase!
			.from("water_logs")
			.update({ glasses: log.glasses })
			.eq("id", existing.id)
			.select()
			.single();
		if (error) throw error;
		return data as WaterLog;
	}
	const { data, error } = await supabase!
		.from("water_logs")
		.insert(log)
		.select()
		.single();
	if (error) throw error;
	return data as WaterLog;
}

// ── Daily Check-Ins ──

export async function getDailyCheckIn(
	user: User,
	date: string,
): Promise<DailyCheckIn | null> {
	if (!isSupabaseConfigured) return null;
	const { data, error } = await supabase!
		.from("daily_checkins")
		.select("*")
		.eq("user", user)
		.eq("date", date)
		.maybeSingle();
	if (error) throw error;
	return data as DailyCheckIn | null;
}

export async function getCheckInHistory(
	user: User,
	limit = 30,
): Promise<DailyCheckIn[]> {
	if (!isSupabaseConfigured) return [];
	const { data, error } = await supabase!
		.from("daily_checkins")
		.select("*")
		.eq("user", user)
		.order("date", { ascending: false })
		.limit(limit);
	if (error) throw error;
	return data as DailyCheckIn[];
}

export async function upsertDailyCheckIn(
	checkIn: Omit<DailyCheckIn, "id" | "created_at">,
): Promise<DailyCheckIn> {
	const existing = await getDailyCheckIn(checkIn.user, checkIn.date);
	if (existing) {
		const { data, error } = await supabase!
			.from("daily_checkins")
			.update(checkIn)
			.eq("id", existing.id)
			.select()
			.single();
		if (error) throw error;
		return data as DailyCheckIn;
	}
	const { data, error } = await supabase!
		.from("daily_checkins")
		.insert(checkIn)
		.select()
		.single();
	if (error) throw error;
	return data as DailyCheckIn;
}

// ── Weigh-Ins ──

export async function getWeighIns(
	user: User,
	limit = 30,
): Promise<WeighIn[]> {
	if (!isSupabaseConfigured) return [];
	const { data, error } = await supabase!
		.from("weigh_ins")
		.select("*")
		.eq("user", user)
		.order("date", { ascending: false })
		.limit(limit);
	if (error) throw error;
	return data as WeighIn[];
}

export async function createWeighIn(
	weighIn: Omit<WeighIn, "id" | "created_at">,
): Promise<WeighIn> {
	const { data, error } = await supabase!
		.from("weigh_ins")
		.insert(weighIn)
		.select()
		.single();
	if (error) throw error;
	return data as WeighIn;
}

export async function deleteWeighIn(id: string): Promise<void> {
	const { error } = await supabase!.from("weigh_ins").delete().eq("id", id);
	if (error) throw error;
}

// ── Fitness Nudges ──

export async function getNudges(
	toUser: User,
	limit = 20,
): Promise<FitnessNudge[]> {
	if (!isSupabaseConfigured) return [];
	const { data, error } = await supabase!
		.from("fitness_nudges")
		.select("*")
		.eq("to_user", toUser)
		.order("created_at", { ascending: false })
		.limit(limit);
	if (error) throw error;
	return data as FitnessNudge[];
}

export async function getUnreadNudgeCount(toUser: User): Promise<number> {
	if (!isSupabaseConfigured) return 0;
	const { count, error } = await supabase!
		.from("fitness_nudges")
		.select("*", { count: "exact", head: true })
		.eq("to_user", toUser)
		.eq("read", false);
	if (error) throw error;
	return count ?? 0;
}

export async function createNudge(
	nudge: Omit<FitnessNudge, "id" | "read" | "created_at">,
): Promise<FitnessNudge> {
	const { data, error } = await supabase!
		.from("fitness_nudges")
		.insert({ ...nudge, read: false })
		.select()
		.single();
	if (error) throw error;
	return data as FitnessNudge;
}

export async function markNudgesRead(toUser: User): Promise<void> {
	const { error } = await supabase!
		.from("fitness_nudges")
		.update({ read: true })
		.eq("to_user", toUser)
		.eq("read", false);
	if (error) throw error;
}
