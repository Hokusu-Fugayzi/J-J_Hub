import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { capitalize } from "@/lib/utils";
import {
	LayoutDashboard,
	CalendarDays,
	Newspaper,
	FolderKanban,
	Columns3,
	Zap,
	MessageCircle,
	Users,
	DollarSign,
	GitBranch,
	StickyNote,
	LogOut,
} from "lucide-react";

const navSections = [
	{
		label: "Home",
		items: [
			{ to: "/", icon: LayoutDashboard, label: "Dashboard" },
			{ to: "/calendar", icon: CalendarDays, label: "Calendar" },
			{ to: "/news", icon: Newspaper, label: "News" },
		],
	},
	{
		label: "Work",
		items: [
			{ to: "/projects", icon: FolderKanban, label: "Projects" },
			{ to: "/board", icon: Columns3, label: "Board" },
			{ to: "/sprints", icon: Zap, label: "Sprints" },
			{ to: "/standups", icon: MessageCircle, label: "Standups" },
		],
	},
	{
		label: "CRM",
		items: [
			{ to: "/contacts", icon: Users, label: "Contacts" },
			{ to: "/deals", icon: DollarSign, label: "Deals" },
			{ to: "/pipeline", icon: GitBranch, label: "Pipeline" },
		],
	},
	{
		label: "Other",
		items: [{ to: "/notes", icon: StickyNote, label: "Notes" }],
	},
];

export function Layout() {
	const { user, logout } = useAuth();

	return (
		<div className="flex h-screen">
			<aside className="w-56 border-r border-border bg-muted/40 flex flex-col">
				<div className="p-4 border-b border-border">
					<h1 className="text-lg font-bold tracking-tight">J&J Hub</h1>
					<p className="text-xs text-muted-foreground">
						{capitalize(user!)} is logged in
					</p>
				</div>
				<nav className="flex-1 p-2 overflow-y-auto">
					{navSections.map((section, idx) => (
						<div key={section.label}>
							{idx > 0 && (
								<div className="my-2 border-t border-border" />
							)}
							<p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{section.label}
							</p>
							<div className="space-y-0.5">
								{section.items.map(({ to, icon: Icon, label }) => (
									<NavLink
										key={to}
										to={to}
										end={to === "/"}
										className={({ isActive }) =>
											`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
												isActive
													? "bg-primary text-primary-foreground"
													: "hover:bg-accent text-foreground"
											}`
										}
									>
										<Icon className="w-4 h-4" />
										{label}
									</NavLink>
								))}
							</div>
						</div>
					))}
				</nav>
				<div className="p-2 border-t border-border">
					<button
						onClick={logout}
						className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full hover:bg-accent text-muted-foreground transition-colors"
					>
						<LogOut className="w-4 h-4" />
						Log out
					</button>
				</div>
			</aside>
			<main className="flex-1 overflow-auto">
				<div className="p-6 max-w-5xl mx-auto">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
