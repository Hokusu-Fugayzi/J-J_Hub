import { useEffect, useState } from "react";
import {
	getNotes,
	createNote,
	updateNote,
	deleteNote,
	getProjects,
} from "@/lib/data";
import { capitalize, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Note, Project } from "@/types";
import { Plus, Trash2, X, Pencil } from "lucide-react";

export function Notes() {
	const { user } = useAuth();
	const [notes, setNotes] = useState<Note[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Note | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const load = () => {
		Promise.all([getNotes(), getProjects()])
			.then(([n, p]) => {
				setNotes(n);
				setProjects(p);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this note?")) return;
		await deleteNote(id);
		load();
	};

	const projectName = (id: string | null) =>
		id ? projects.find((p) => p.id === id)?.name || "Unknown" : null;

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
					<h1 className="text-2xl font-bold">Notes</h1>
					<p className="text-muted-foreground text-sm">
						Capture ideas, meeting notes, and more
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Note
				</button>
			</div>

			{showForm && (
				<NoteForm
					note={editing}
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

			<div className="space-y-3">
				{notes.map((note) => (
					<div
						key={note.id}
						className="border border-border rounded-lg p-4 group"
					>
						<div className="flex items-start justify-between">
							<button
								onClick={() =>
									setExpandedId(expandedId === note.id ? null : note.id)
								}
								className="text-left flex-1"
							>
								<h3 className="font-semibold text-sm">{note.title}</h3>
								<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
									<span>{capitalize(note.created_by)}</span>
									{note.project_id && (
										<>
											<span>&middot;</span>
											<span>{projectName(note.project_id)}</span>
										</>
									)}
									<span>&middot;</span>
									<span>{timeAgo(note.updated_at)}</span>
								</div>
							</button>
							<div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => {
										setEditing(note);
										setShowForm(true);
									}}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
								<button
									onClick={() => handleDelete(note.id)}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
							</div>
						</div>
						{expandedId === note.id && (
							<div className="mt-3 pt-3 border-t border-border text-sm whitespace-pre-wrap">
								{note.content || "No content"}
							</div>
						)}
					</div>
				))}
			</div>

			{notes.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No notes yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Create your first note
					</button>
				</div>
			)}
		</div>
	);
}

function NoteForm({
	note,
	projects,
	currentUser,
	onSave,
	onCancel,
}: {
	note: Note | null;
	projects: Project[];
	currentUser: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = useState(note?.title || "");
	const [content, setContent] = useState(note?.content || "");
	const [projectId, setProjectId] = useState(note?.project_id || "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		if (note) {
			await updateNote(note.id, {
				title,
				content,
				project_id: projectId || null,
			});
		} else {
			await createNote({
				title,
				content,
				project_id: projectId || null,
				created_by: currentUser as Note["created_by"],
			});
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
					{note ? "Edit Note" : "New Note"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Note title"
				required
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Write your note..."
				rows={6}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
			/>
			<select
				value={projectId}
				onChange={(e) => setProjectId(e.target.value)}
				className="px-3 py-2 border border-input rounded-md text-sm bg-background"
			>
				<option value="">No project</option>
				{projects.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
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
					disabled={saving || !title}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : note ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}
