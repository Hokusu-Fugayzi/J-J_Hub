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
} from "@/types";

const API_URL = "http://localhost:3001";
const API_KEY = "jj_dev_key_2026";

async function api<T>(
	path: string,
	options?: { method?: string; body?: any },
): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		method: options?.method || "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${API_KEY}`,
		},
		body: options?.body ? JSON.stringify(options.body) : undefined,
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: res.statusText }));
		throw new Error(err.error || res.statusText);
	}
	return res.json();
}

// ── Projects ──

export async function getProjects(): Promise<Project[]> {
	return api<Project[]>("/api/projects");
}

export async function getProject(id: string): Promise<Project> {
	return api<Project>(`/api/projects/${id}`);
}

export async function createProject(
	project: Omit<Project, "id" | "created_at" | "updated_at">,
): Promise<Project> {
	return api<Project>("/api/projects", { method: "POST", body: project });
}

export async function updateProject(
	id: string,
	updates: Partial<Project>,
): Promise<Project> {
	return api<Project>(`/api/projects/${id}`, { method: "PATCH", body: updates });
}

export async function deleteProject(id: string): Promise<void> {
	await api(`/api/projects/${id}`, { method: "DELETE" });
}

// ── Tasks ──

export async function getTasks(filters?: {
	project_id?: string;
	assigned_to?: User;
	status?: Task["status"];
	sprint_id?: string;
}): Promise<Task[]> {
	const params = new URLSearchParams();
	if (filters?.project_id) params.set("project_id", filters.project_id);
	if (filters?.assigned_to) params.set("assigned_to", filters.assigned_to);
	if (filters?.status) params.set("status", filters.status);
	if (filters?.sprint_id) params.set("sprint_id", filters.sprint_id);
	const qs = params.toString();
	return api<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
}

export async function createTask(
	task: Omit<Task, "id" | "created_at" | "updated_at">,
): Promise<Task> {
	return api<Task>("/api/tasks", { method: "POST", body: task });
}

export async function updateTask(
	id: string,
	updates: Partial<Task>,
): Promise<Task> {
	return api<Task>(`/api/tasks/${id}`, { method: "PATCH", body: updates });
}

export async function deleteTask(id: string): Promise<void> {
	await api(`/api/tasks/${id}`, { method: "DELETE" });
}

// ── Notes ──

export async function getNotes(filters?: {
	project_id?: string;
}): Promise<Note[]> {
	const params = new URLSearchParams();
	if (filters?.project_id) params.set("project_id", filters.project_id);
	const qs = params.toString();
	return api<Note[]>(`/api/notes${qs ? `?${qs}` : ""}`);
}

export async function createNote(
	note: Omit<Note, "id" | "created_at" | "updated_at">,
): Promise<Note> {
	return api<Note>("/api/notes", { method: "POST", body: note });
}

export async function updateNote(
	id: string,
	updates: Partial<Note>,
): Promise<Note> {
	return api<Note>(`/api/notes/${id}`, { method: "PATCH", body: updates });
}

export async function deleteNote(id: string): Promise<void> {
	await api(`/api/notes/${id}`, { method: "DELETE" });
}

// ── Calendar Events ──

export async function getEvents(filters?: {
	date?: string;
	assigned_to?: User;
}): Promise<CalendarEvent[]> {
	const params = new URLSearchParams();
	if (filters?.date) params.set("date", filters.date);
	if (filters?.assigned_to) params.set("assigned_to", filters.assigned_to);
	const qs = params.toString();
	return api<CalendarEvent[]>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function createEvent(
	event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">,
): Promise<CalendarEvent> {
	return api<CalendarEvent>("/api/events", { method: "POST", body: event });
}

export async function updateEvent(
	id: string,
	updates: Partial<CalendarEvent>,
): Promise<CalendarEvent> {
	return api<CalendarEvent>(`/api/events/${id}`, { method: "PATCH", body: updates });
}

export async function deleteEvent(id: string): Promise<void> {
	await api(`/api/events/${id}`, { method: "DELETE" });
}

// ── Sprints ──

export async function getSprints(): Promise<Sprint[]> {
	return api<Sprint[]>("/api/sprints");
}

export async function createSprint(
	sprint: Omit<Sprint, "id" | "created_at" | "updated_at">,
): Promise<Sprint> {
	return api<Sprint>("/api/sprints", { method: "POST", body: sprint });
}

export async function updateSprint(
	id: string,
	updates: Partial<Sprint>,
): Promise<Sprint> {
	return api<Sprint>(`/api/sprints/${id}`, { method: "PATCH", body: updates });
}

export async function deleteSprint(id: string): Promise<void> {
	await api(`/api/sprints/${id}`, { method: "DELETE" });
}

// ── Standups ──

export async function getStandups(filters?: {
	user?: User;
	date?: string;
}): Promise<StandupEntry[]> {
	const params = new URLSearchParams();
	if (filters?.user) params.set("user", filters.user);
	if (filters?.date) params.set("date", filters.date);
	const qs = params.toString();
	return api<StandupEntry[]>(`/api/standups${qs ? `?${qs}` : ""}`);
}

export async function createStandup(
	standup: Omit<StandupEntry, "id" | "created_at">,
): Promise<StandupEntry> {
	return api<StandupEntry>("/api/standups", { method: "POST", body: standup });
}

export async function deleteStandup(id: string): Promise<void> {
	await api(`/api/standups/${id}`, { method: "DELETE" });
}

// ── Contacts ──

export async function getContacts(filters?: {
	search?: string;
}): Promise<Contact[]> {
	const params = new URLSearchParams();
	if (filters?.search) params.set("search", filters.search);
	const qs = params.toString();
	return api<Contact[]>(`/api/contacts${qs ? `?${qs}` : ""}`);
}

export async function createContact(
	contact: Omit<Contact, "id" | "created_at" | "updated_at">,
): Promise<Contact> {
	return api<Contact>("/api/contacts", { method: "POST", body: contact });
}

export async function updateContact(
	id: string,
	updates: Partial<Contact>,
): Promise<Contact> {
	return api<Contact>(`/api/contacts/${id}`, { method: "PATCH", body: updates });
}

export async function deleteContact(id: string): Promise<void> {
	await api(`/api/contacts/${id}`, { method: "DELETE" });
}

// ── Deals ──

export async function getDeals(filters?: {
	stage?: Deal["stage"];
	contact_id?: string;
}): Promise<Deal[]> {
	const params = new URLSearchParams();
	if (filters?.stage) params.set("stage", filters.stage);
	if (filters?.contact_id) params.set("contact_id", filters.contact_id);
	const qs = params.toString();
	return api<Deal[]>(`/api/deals${qs ? `?${qs}` : ""}`);
}

export async function createDeal(
	deal: Omit<Deal, "id" | "created_at" | "updated_at">,
): Promise<Deal> {
	return api<Deal>("/api/deals", { method: "POST", body: deal });
}

export async function updateDeal(
	id: string,
	updates: Partial<Deal>,
): Promise<Deal> {
	return api<Deal>(`/api/deals/${id}`, { method: "PATCH", body: updates });
}

export async function deleteDeal(id: string): Promise<void> {
	await api(`/api/deals/${id}`, { method: "DELETE" });
}

// ── Contact Activities ──

export async function getContactActivities(
	contactId: string,
): Promise<ContactActivity[]> {
	return api<ContactActivity[]>(`/api/contact-activities?contact_id=${contactId}`);
}

export async function createContactActivity(
	activity: Omit<ContactActivity, "id" | "created_at">,
): Promise<ContactActivity> {
	return api<ContactActivity>("/api/contact-activities", {
		method: "POST",
		body: activity,
	});
}

export async function deleteContactActivity(id: string): Promise<void> {
	await api(`/api/contact-activities/${id}`, { method: "DELETE" });
}

// ── News Posts ──

export async function getNewsPosts(): Promise<NewsPost[]> {
	return api<NewsPost[]>("/api/news");
}

export async function createNewsPost(
	post: Omit<NewsPost, "id" | "created_at" | "updated_at">,
): Promise<NewsPost> {
	return api<NewsPost>("/api/news", { method: "POST", body: post });
}

export async function updateNewsPost(
	id: string,
	updates: Partial<NewsPost>,
): Promise<NewsPost> {
	return api<NewsPost>(`/api/news/${id}`, { method: "PATCH", body: updates });
}

export async function deleteNewsPost(id: string): Promise<void> {
	await api(`/api/news/${id}`, { method: "DELETE" });
}

// ── Mood Status ──

export async function getMoods(date?: string): Promise<MoodStatus[]> {
	const params = new URLSearchParams();
	if (date) params.set("date", date);
	const qs = params.toString();
	return api<MoodStatus[]>(`/api/moods${qs ? `?${qs}` : ""}`);
}

export async function setMood(
	mood: Omit<MoodStatus, "id" | "created_at">,
): Promise<MoodStatus> {
	// Check if mood already exists for this user+date
	const existing = await getMoods(mood.date);
	const found = existing.find((m) => m.user === mood.user);
	if (found) {
		return api<MoodStatus>(`/api/moods/${found.id}`, {
			method: "PATCH",
			body: { emoji: mood.emoji, label: mood.label },
		});
	}
	return api<MoodStatus>("/api/moods", { method: "POST", body: mood });
}
