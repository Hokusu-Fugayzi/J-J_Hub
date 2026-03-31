import { useEffect, useState } from "react";
import { getStandups, createStandup, deleteStandup } from "@/lib/data";
import { capitalize, formatDate, toDateString } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { StandupEntry } from "@/types";
import { Trash2, AlertCircle } from "lucide-react";

export function Standups() {
	const { user } = useAuth();
	const [standups, setStandups] = useState<StandupEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [did, setDid] = useState("");
	const [doing, setDoing] = useState("");
	const [blockers, setBlockers] = useState("");
	const [saving, setSaving] = useState(false);
	const [filterUser, setFilterUser] = useState<string>("all");

	const today = toDateString(new Date());

	const load = () => {
		getStandups()
			.then(setStandups)
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const hasPostedToday = standups.some(
		(s) => s.user === user && s.date === today,
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			await createStandup({
				user: user!,
				date: today,
				did,
				doing,
				blockers,
			});
			setDid("");
			setDoing("");
			setBlockers("");
			load();
		} catch (err) {
			console.error("Failed to create standup:", err);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this standup?")) return;
		await deleteStandup(id);
		load();
	};

	const filtered =
		filterUser === "all"
			? standups
			: standups.filter((s) => s.user === filterUser);

	// Group by date
	const grouped = filtered.reduce(
		(acc, s) => {
			if (!acc[s.date]) acc[s.date] = [];
			acc[s.date].push(s);
			return acc;
		},
		{} as Record<string, StandupEntry[]>,
	);

	const sortedDates = Object.keys(grouped).sort((a, b) =>
		b.localeCompare(a),
	);

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
					<h1 className="text-2xl font-bold">Standups</h1>
					<p className="text-muted-foreground text-sm">
						Daily check-ins — what you did, what you're doing, any
						blockers
					</p>
				</div>
				<select
					value={filterUser}
					onChange={(e) => setFilterUser(e.target.value)}
					className="px-3 py-1.5 border border-input rounded-md text-sm bg-background"
				>
					<option value="all">Everyone</option>
					<option value="jonah">Jonah</option>
					<option value="julian">Julian</option>
				</select>
			</div>

			{!hasPostedToday ? (
				<form
					onSubmit={handleSubmit}
					className="border border-border rounded-lg p-4 mb-6 space-y-3"
				>
					<div className="flex items-center gap-2">
						<AlertCircle className="w-4 h-4 text-yellow-500" />
						<h3 className="font-semibold text-sm">
							Today's Standup — {capitalize(user!)}
						</h3>
					</div>
					<div>
						<label className="text-xs text-muted-foreground font-medium">
							What did you do yesterday?
						</label>
						<textarea
							value={did}
							onChange={(e) => setDid(e.target.value)}
							placeholder="Shipped the new dashboard, fixed auth bug..."
							rows={2}
							className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
						/>
					</div>
					<div>
						<label className="text-xs text-muted-foreground font-medium">
							What are you working on today?
						</label>
						<textarea
							value={doing}
							onChange={(e) => setDoing(e.target.value)}
							placeholder="Starting the calendar feature, reviewing PR..."
							rows={2}
							className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
						/>
					</div>
					<div>
						<label className="text-xs text-muted-foreground font-medium">
							Any blockers?
						</label>
						<textarea
							value={blockers}
							onChange={(e) => setBlockers(e.target.value)}
							placeholder="Waiting on API access, need design review..."
							rows={2}
							className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
						/>
					</div>
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={saving || (!did && !doing)}
							className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
						>
							{saving ? "Posting..." : "Post Standup"}
						</button>
					</div>
				</form>
			) : (
				<div className="border border-green-200 bg-green-50 rounded-lg p-3 mb-6 text-sm text-green-700">
					You've posted your standup for today. Nice!
				</div>
			)}

			<div className="space-y-6">
				{sortedDates.map((date) => (
					<div key={date}>
						<h3 className="text-sm font-semibold mb-2 text-muted-foreground">
							{date === today
								? "Today"
								: formatDate(date + "T12:00:00")}
						</h3>
						<div className="space-y-2">
							{grouped[date].map((entry) => (
								<div
									key={entry.id}
									className="border border-border rounded-lg p-4 group"
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
												{entry.user[0].toUpperCase()}
											</div>
											<span className="font-semibold text-sm">
												{capitalize(entry.user)}
											</span>
										</div>
										<button
											onClick={() => handleDelete(entry.id)}
											className="p-2 rounded md:opacity-0 md:group-hover:opacity-100 hover:bg-accent transition-opacity"
										>
											<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
									</div>
									<div className="space-y-2 text-sm">
										{entry.did && (
											<div>
												<span className="text-xs font-medium text-muted-foreground">
													Yesterday:
												</span>
												<p className="whitespace-pre-wrap">
													{entry.did}
												</p>
											</div>
										)}
										{entry.doing && (
											<div>
												<span className="text-xs font-medium text-muted-foreground">
													Today:
												</span>
												<p className="whitespace-pre-wrap">
													{entry.doing}
												</p>
											</div>
										)}
										{entry.blockers && (
											<div>
												<span className="text-xs font-medium text-red-500">
													Blockers:
												</span>
												<p className="whitespace-pre-wrap text-red-600">
													{entry.blockers}
												</p>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{standups.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					No standups yet. Post your first one above!
				</div>
			)}
		</div>
	);
}
