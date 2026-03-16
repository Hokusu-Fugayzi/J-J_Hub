import { supabase, isSupabaseConfigured } from "./supabase";
import type { Project, Task, Note, User } from "@/types";

function notConfigured(): never {
	throw new Error(
		"Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env",
	);
}

// Projects
export async function getProjects() {
	if (!isSupabaseConfigured) return [];
	const { data, error } = await supabase!
		.from("projects")
		.select("*")
		.order("updated_at", { ascending: false });
	if (error) throw error;
	return data as Project[];
}

export async function getProject(id: string) {
	if (!isSupabaseConfigured) notConfigured();
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
) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("projects")
		.insert(project)
		.select()
		.single();
	if (error) throw error;
	return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("projects")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Project;
}

export async function deleteProject(id: string) {
	if (!isSupabaseConfigured) notConfigured();
	const { error } = await supabase!.from("projects").delete().eq("id", id);
	if (error) throw error;
}

// Tasks
export async function getTasks(filters?: {
	project_id?: string;
	assigned_to?: User;
	status?: Task["status"];
}) {
	if (!isSupabaseConfigured) return [];
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

	const { data, error } = await query;
	if (error) throw error;
	return data as Task[];
}

export async function createTask(
	task: Omit<Task, "id" | "created_at" | "updated_at">,
) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("tasks")
		.insert(task)
		.select()
		.single();
	if (error) throw error;
	return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("tasks")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Task;
}

export async function deleteTask(id: string) {
	if (!isSupabaseConfigured) notConfigured();
	const { error } = await supabase!.from("tasks").delete().eq("id", id);
	if (error) throw error;
}

// Notes
export async function getNotes(filters?: { project_id?: string }) {
	if (!isSupabaseConfigured) return [];
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
) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("notes")
		.insert(note)
		.select()
		.single();
	if (error) throw error;
	return data as Note;
}

export async function updateNote(id: string, updates: Partial<Note>) {
	if (!isSupabaseConfigured) notConfigured();
	const { data, error } = await supabase!
		.from("notes")
		.update({ ...updates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return data as Note;
}

export async function deleteNote(id: string) {
	if (!isSupabaseConfigured) notConfigured();
	const { error } = await supabase!.from("notes").delete().eq("id", id);
	if (error) throw error;
}
