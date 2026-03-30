import { useEffect, useState } from "react";
import { getDeals, updateDeal, getContacts } from "@/lib/data";
import { capitalize, formatCurrency } from "@/lib/utils";
import type { Deal, Contact } from "@/types";

const STAGES: Deal["stage"][] = [
	"lead",
	"proposal",
	"negotiation",
	"won",
	"lost",
];

const stageColors: Record<string, string> = {
	lead: "border-t-gray-400",
	proposal: "border-t-blue-400",
	negotiation: "border-t-yellow-400",
	won: "border-t-green-400",
	lost: "border-t-red-400",
};

const stageBg: Record<string, string> = {
	lead: "bg-gray-50",
	proposal: "bg-blue-50",
	negotiation: "bg-yellow-50",
	won: "bg-green-50",
	lost: "bg-red-50",
};

export function Pipeline() {
	const [deals, setDeals] = useState<Deal[]>([]);
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(true);
	const [draggedId, setDraggedId] = useState<string | null>(null);

	const load = () => {
		Promise.all([getDeals(), getContacts()])
			.then(([d, c]) => {
				setDeals(d);
				setContacts(c);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const contactName = (id: string | null) =>
		id ? contacts.find((c) => c.id === id)?.name || "Unknown" : null;

	const handleDragStart = (dealId: string) => {
		setDraggedId(dealId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (stage: Deal["stage"]) => {
		if (!draggedId) return;
		const deal = deals.find((d) => d.id === draggedId);
		if (deal && deal.stage !== stage) {
			await updateDeal(draggedId, { stage });
			load();
		}
		setDraggedId(null);
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
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Pipeline</h1>
				<p className="text-muted-foreground text-sm">
					Drag deals between stages to update them
				</p>
			</div>

			<div className="grid grid-cols-5 gap-3 min-h-[500px]">
				{STAGES.map((stage) => {
					const stageDeals = deals.filter((d) => d.stage === stage);
					const totalValue = stageDeals.reduce(
						(sum, d) => sum + d.value,
						0,
					);

					return (
						<div
							key={stage}
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(stage)}
							className={`rounded-lg border border-border border-t-4 ${stageColors[stage]} p-3`}
						>
							<div className="mb-3">
								<h3 className="font-semibold text-sm">
									{capitalize(stage)}
								</h3>
								<p className="text-xs text-muted-foreground">
									{stageDeals.length} deal
									{stageDeals.length !== 1 ? "s" : ""} &middot;{" "}
									{formatCurrency(totalValue)}
								</p>
							</div>

							<div className="space-y-2">
								{stageDeals.map((deal) => (
									<div
										key={deal.id}
										draggable
										onDragStart={() => handleDragStart(deal.id)}
										className={`p-3 rounded-md border border-border bg-background cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${draggedId === deal.id ? "opacity-50" : ""}`}
									>
										<p className="text-sm font-medium">{deal.name}</p>
										<p className="text-sm font-bold text-green-600 mt-1">
											{formatCurrency(deal.value)}
										</p>
										{contactName(deal.contact_id) && (
											<p className="text-xs text-muted-foreground mt-1">
												{contactName(deal.contact_id)}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
