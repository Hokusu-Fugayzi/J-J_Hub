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
