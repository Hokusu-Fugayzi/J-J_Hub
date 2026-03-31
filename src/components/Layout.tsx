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
	Menu,
	X,
} from "lucide-react";
import { useState } from "react";
import japjuLogo from "@/assets/japju-logo.png";

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

// Bottom nav items for mobile — the most important pages
const mobileNav = [
	{ to: "/", icon: LayoutDashboard, label: "Home" },
	{ to: "/board", icon: Columns3, label: "Board" },
	{ to: "/calendar", icon: CalendarDays, label: "Calendar" },
	{ to: "/deals", icon: DollarSign, label: "Deals" },
	{ to: "/news", icon: Newspaper, label: "News" },
];

export function Layout() {
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="flex h-screen">
			{/* Desktop sidebar */}
			<aside className="hidden md:flex w-56 border-r border-border bg-muted/40 flex-col">
				<div className="p-2 border-b border-border">
					<img src={japjuLogo} alt="JAPJU" className="w-full object-contain" />
					<p className="text-xs text-muted-foreground italic text-center">a home for you</p>
					<p className="text-xs text-muted-foreground text-center mt-0.5">
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

			{/* Mobile header */}
			<div className="flex flex-col flex-1 min-h-0">
				<header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
					<img src={japjuLogo} alt="JAPJU" className="h-8 object-contain" />
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="p-2 rounded-md hover:bg-accent"
					>
						{mobileMenuOpen ? (
							<X className="w-5 h-5" />
						) : (
							<Menu className="w-5 h-5" />
						)}
					</button>
				</header>

				{/* Mobile slide-out menu */}
				{mobileMenuOpen && (
					<div
						className="md:hidden fixed inset-0 z-50 bg-black/50"
						onClick={() => setMobileMenuOpen(false)}
					>
						<div
							className="absolute right-0 top-0 bottom-0 w-64 bg-background border-l border-border overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-4 border-b border-border flex items-center justify-between">
								<div>
									<p className="font-semibold text-sm">
										{capitalize(user!)}
									</p>
									<p className="text-xs text-muted-foreground">Logged in</p>
								</div>
								<button
									onClick={() => setMobileMenuOpen(false)}
									className="p-1"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<nav className="p-2">
								{navSections.map((section, idx) => (
									<div key={section.label}>
										{idx > 0 && (
											<div className="my-2 border-t border-border" />
										)}
										<p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
											{section.label}
										</p>
										{section.items.map(({ to, icon: Icon, label }) => (
											<NavLink
												key={to}
												to={to}
												end={to === "/"}
												onClick={() => setMobileMenuOpen(false)}
												className={({ isActive }) =>
													`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
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
								))}
							</nav>
							<div className="p-2 border-t border-border">
								<button
									onClick={logout}
									className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm w-full hover:bg-accent text-muted-foreground"
								>
									<LogOut className="w-4 h-4" />
									Log out
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Main content */}
				<main className="flex-1 overflow-auto pb-20 md:pb-0">
					<div className="p-4 md:p-6 max-w-5xl mx-auto">
						<Outlet />
					</div>
				</main>

				{/* Mobile bottom nav */}
				<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
					<div className="flex items-center justify-around py-2">
						{mobileNav.map(({ to, icon: Icon, label }) => (
							<NavLink
								key={to}
								to={to}
								end={to === "/"}
								className={({ isActive }) =>
									`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs transition-colors min-w-[44px] min-h-[44px] justify-center ${
										isActive
											? "text-primary font-semibold"
											: "text-muted-foreground"
									}`
								}
							>
								<Icon className="w-5 h-5" />
								{label}
							</NavLink>
						))}
					</div>
				</nav>
			</div>
		</div>
	);
}
