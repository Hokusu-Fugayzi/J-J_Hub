import { useEffect, useState } from "react";
import {
	getDeals,
	createDeal,
	updateDeal,
	deleteDeal,
	getContacts,
	getProjects,
} from "@/lib/data";
import { capitalize, formatCurrency, timeAgo } from "@/lib/utils";
import type { Deal, Contact, Project } from "@/types";
import { Plus, Trash2, X, Pencil } from "lucide-react";

const STAGES: Deal["stage"][] = [
	"lead",
	"proposal",
	"negotiation",
	"won",
	"lost",
];

const stageColors: Record<string, string> = {
	lead: "bg-gray-100 text-gray-700",
	proposal: "bg-blue-100 text-blue-700",
	negotiation: "bg-yellow-100 text-yellow-700",
	won: "bg-green-100 text-green-700",
	lost: "bg-red-100 text-red-700",
};

export function Deals() {
	const [deals, setDeals] = useState<Deal[]>([]);
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<Deal | null>(null);
	const [filterStage, setFilterStage] = useState<string>("all");

	const load = () => {
		Promise.all([getDeals(), getContacts(), getProjects()])
			.then(([d, c, p]) => {
				setDeals(d);
				setContacts(c);
				setProjects(p);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this deal?")) return;
		await deleteDeal(id);
		load();
	};

	const contactName = (id: string | null) =>
		id ? contacts.find((c) => c.id === id)?.name || "Unknown" : null;

	const projectName = (id: string | null) =>
		id ? projects.find((p) => p.id === id)?.name || "Unknown" : null;

	const filtered =
		filterStage === "all"
			? deals
			: deals.filter((d) => d.stage === filterStage);

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
					<h1 className="text-2xl font-bold">Deals</h1>
					<p className="text-muted-foreground text-sm">
						Track opportunities and revenue
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Deal
				</button>
			</div>

			<div className="flex gap-2 mb-4">
				<select
					value={filterStage}
					onChange={(e) => setFilterStage(e.target.value)}
					className="px-3 py-1.5 border border-input rounded-md text-sm bg-background"
				>
					<option value="all">All stages</option>
					{STAGES.map((s) => (
						<option key={s} value={s}>
							{capitalize(s)}
						</option>
					))}
				</select>
			</div>

			{showForm && (
				<DealForm
					deal={editing}
					contacts={contacts}
					projects={projects}
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

			<div className="space-y-2">
				{filtered.map((deal) => (
					<div
						key={deal.id}
						className="flex items-center justify-between p-4 border border-border rounded-lg group"
					>
						<div className="flex-1 min-w-0">
							<div className="flex flex-wrap items-center gap-2 sm:gap-3">
								<h3 className="font-semibold text-sm">{deal.name}</h3>
								<span
									className={`text-xs px-2 py-0.5 rounded-full ${stageColors[deal.stage]}`}
								>
									{deal.stage}
								</span>
								<span className="text-sm font-bold text-green-600">
									{formatCurrency(deal.value)}
								</span>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
								{contactName(deal.contact_id) && (
									<span>{contactName(deal.contact_id)}</span>
								)}
								{contactName(deal.contact_id) &&
									projectName(deal.project_id) && (
										<span>&middot;</span>
									)}
								{projectName(deal.project_id) && (
									<span>{projectName(deal.project_id)}</span>
								)}
								<span>&middot;</span>
								<span>{timeAgo(deal.updated_at)}</span>
							</div>
						</div>
						<div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => {
									setEditing(deal);
									setShowForm(true);
								}}
								className="p-1.5 rounded hover:bg-accent"
							>
								<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
							</button>
							<button
								onClick={() => handleDelete(deal.id)}
								className="p-1.5 rounded hover:bg-accent"
							>
								<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
							</button>
						</div>
					</div>
				))}
			</div>

			{filtered.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No deals yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Create your first deal
					</button>
				</div>
			)}
		</div>
	);
}

function DealForm({
	deal,
	contacts,
	projects,
	onSave,
	onCancel,
}: {
	deal: Deal | null;
	contacts: Contact[];
	projects: Project[];
	onSave: () => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(deal?.name || "");
	const [value, setValue] = useState(String(deal?.value || ""));
	const [stage, setStage] = useState<string>(deal?.stage || "lead");
	const [contactId, setContactId] = useState(deal?.contact_id || "");
	const [projectId, setProjectId] = useState(deal?.project_id || "");
	const [notes, setNotes] = useState(deal?.notes || "");
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		const payload = {
			name,
			value: Number(value) || 0,
			stage: stage as Deal["stage"],
			contact_id: contactId || null,
			project_id: projectId || null,
			notes,
		};
		if (deal) {
			await updateDeal(deal.id, payload);
		} else {
			await createDeal(payload);
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
					{deal ? "Edit Deal" : "New Deal"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Deal name"
				required
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<div className="grid grid-cols-2 gap-3">
				<input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Value ($)"
					type="number"
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<select
					value={stage}
					onChange={(e) => setStage(e.target.value)}
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					{STAGES.map((s) => (
						<option key={s} value={s}>
							{capitalize(s)}
						</option>
					))}
				</select>
				<select
					value={contactId}
					onChange={(e) => setContactId(e.target.value)}
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					<option value="">No contact</option>
					{contacts.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
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
			<textarea
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder="Notes"
				rows={2}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
					{saving ? "Saving..." : deal ? "Update" : "Create"}
				</button>
			</div>
		</form>
	);
}
