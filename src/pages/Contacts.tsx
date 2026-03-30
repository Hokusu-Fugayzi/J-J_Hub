import { useEffect, useState } from "react";
import {
	getContacts,
	createContact,
	updateContact,
	deleteContact,
	getContactActivities,
	createContactActivity,
	deleteContactActivity,
} from "@/lib/data";
import { capitalize, timeAgo, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { Contact, ContactActivity } from "@/types";
import {
	Plus,
	Trash2,
	X,
	Pencil,
	Search,
	Phone,
	Mail,
	Building,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { toDateString } from "@/lib/utils";

const ACTIVITY_TYPES = ["call", "email", "meeting", "note"] as const;

const activityIcons: Record<string, string> = {
	call: "phone",
	email: "mail",
	meeting: "calendar",
	note: "file-text",
};

export function Contacts() {
	const { user } = useAuth();
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Contact | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const load = () => {
		getContacts(searchQuery ? { search: searchQuery } : undefined)
			.then(setContacts)
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, [searchQuery]);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this contact and all their activities?")) return;
		await deleteContact(id);
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
					<h1 className="text-2xl font-bold">Contacts</h1>
					<p className="text-muted-foreground text-sm">
						People and companies you work with
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Contact
				</button>
			</div>

			<div className="relative mb-4">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search contacts..."
					className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			{showForm && (
				<ContactForm
					contact={editing}
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
				{contacts.map((contact) => (
					<div
						key={contact.id}
						className="border border-border rounded-lg group"
					>
						<div className="p-4">
							<div className="flex items-start justify-between">
								<button
									onClick={() =>
										setExpandedId(
											expandedId === contact.id ? null : contact.id,
										)
									}
									className="text-left flex-1"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
											{contact.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()
												.slice(0, 2)}
										</div>
										<div>
											<h3 className="font-semibold text-sm">
												{contact.name}
											</h3>
											<div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
												{contact.company && (
													<span className="flex items-center gap-1">
														<Building className="w-3 h-3" />
														{contact.company}
													</span>
												)}
												{contact.email && (
													<span className="flex items-center gap-1">
														<Mail className="w-3 h-3" />
														{contact.email}
													</span>
												)}
												{contact.phone && (
													<span className="flex items-center gap-1">
														<Phone className="w-3 h-3" />
														{contact.phone}
													</span>
												)}
											</div>
										</div>
									</div>
									{contact.tags.length > 0 && (
										<div className="flex gap-1 mt-2 ml-13">
											{contact.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
												>
													{tag}
												</span>
											))}
										</div>
									)}
								</button>
								<div className="flex items-center gap-1">
									{expandedId === contact.id ? (
										<ChevronUp className="w-4 h-4 text-muted-foreground" />
									) : (
										<ChevronDown className="w-4 h-4 text-muted-foreground" />
									)}
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											onClick={() => {
												setEditing(contact);
												setShowForm(true);
											}}
											className="p-1.5 rounded hover:bg-accent"
										>
											<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
										<button
											onClick={() => handleDelete(contact.id)}
											className="p-1.5 rounded hover:bg-accent"
										>
											<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
									</div>
								</div>
							</div>
						</div>

						{expandedId === contact.id && (
							<ContactDetail contact={contact} currentUser={user!} />
						)}
					</div>
				))}
			</div>

			{contacts.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No contacts yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Add your first contact
					</button>
				</div>
			)}
		</div>
	);
}

function ContactDetail({
	contact,
	currentUser,
}: {
	contact: Contact;
	currentUser: string;
}) {
	const [activities, setActivities] = useState<ContactActivity[]>([]);
	const [showActivityForm, setShowActivityForm] = useState(false);
	const [activityType, setActivityType] = useState<string>("note");
	const [activityDesc, setActivityDesc] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		getContactActivities(contact.id).then(setActivities);
	}, [contact.id]);

	const handleAddActivity = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		await createContactActivity({
			contact_id: contact.id,
			type: activityType as ContactActivity["type"],
			description: activityDesc,
			date: toDateString(new Date()),
			created_by: currentUser as ContactActivity["created_by"],
		});
		setActivityDesc("");
		setShowActivityForm(false);
		setSaving(false);
		getContactActivities(contact.id).then(setActivities);
	};

	const handleDeleteActivity = async (id: string) => {
		await deleteContactActivity(id);
		getContactActivities(contact.id).then(setActivities);
	};

	return (
		<div className="border-t border-border p-4">
			{contact.notes && (
				<p className="text-sm text-muted-foreground mb-3">
					{contact.notes}
				</p>
			)}
			<div className="flex items-center justify-between mb-2">
				<h4 className="text-sm font-semibold">Activity</h4>
				<button
					onClick={() => setShowActivityForm(!showActivityForm)}
					className="text-xs px-2 py-1 rounded hover:bg-accent"
				>
					+ Log Activity
				</button>
			</div>
			{showActivityForm && (
				<form
					onSubmit={handleAddActivity}
					className="flex gap-2 mb-3"
				>
					<select
						value={activityType}
						onChange={(e) => setActivityType(e.target.value)}
						className="px-2 py-1.5 border border-input rounded-md text-xs bg-background"
					>
						{ACTIVITY_TYPES.map((t) => (
							<option key={t} value={t}>
								{capitalize(t)}
							</option>
						))}
					</select>
					<input
						value={activityDesc}
						onChange={(e) => setActivityDesc(e.target.value)}
						placeholder="What happened?"
						required
						className="flex-1 px-2 py-1.5 border border-input rounded-md text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring"
					/>
					<button
						type="submit"
						disabled={saving || !activityDesc}
						className="px-2 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 disabled:opacity-50"
					>
						{saving ? "..." : "Log"}
					</button>
				</form>
			)}
			<div className="space-y-2">
				{activities.map((act) => (
					<div
						key={act.id}
						className="flex items-center justify-between text-xs group/act"
					>
						<div className="flex items-center gap-2">
							<span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
								{act.type}
							</span>
							<span>{act.description}</span>
							<span className="text-muted-foreground">
								{formatDate(act.date)} &middot; {capitalize(act.created_by)}
							</span>
						</div>
						<button
							onClick={() => handleDeleteActivity(act.id)}
							className="opacity-0 group-hover/act:opacity-100 p-1 hover:bg-accent rounded"
						>
							<Trash2 className="w-3 h-3 text-muted-foreground" />
						</button>
					</div>
				))}
				{activities.length === 0 && (
					<p className="text-xs text-muted-foreground">
						No activity logged yet
					</p>
				)}
			</div>
		</div>
	);
}

function ContactForm({
	contact,
	onSave,
	onCancel,
}: {
	contact: Contact | null;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(contact?.name || "");
	const [email, setEmail] = useState(contact?.email || "");
	const [phone, setPhone] = useState(contact?.phone || "");
	const [company, setCompany] = useState(contact?.company || "");
	const [notes, setNotes] = useState(contact?.notes || "");
	const [tagsStr, setTagsStr] = useState(contact?.tags.join(", ") || "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const tags = tagsStr
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		if (contact) {
			await updateContact(contact.id, {
				name,
				email,
				phone,
				company,
				notes,
				tags,
			});
		} else {
			await createContact({ name, email, phone, company, notes, tags });
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
					{contact ? "Edit Contact" : "New Contact"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Full name"
				required
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<div className="grid grid-cols-2 gap-3">
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Email"
					type="email"
					className="px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<input
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="Phone"
					className="px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<input
				value={company}
				onChange={(e) => setCompany(e.target.value)}
				placeholder="Company"
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<textarea
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder="Notes"
				rows={2}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
			/>
			<input
				value={tagsStr}
				onChange={(e) => setTagsStr(e.target.value)}
				placeholder="Tags (comma-separated)"
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
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
					disabled={saving || !name}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : contact ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}
