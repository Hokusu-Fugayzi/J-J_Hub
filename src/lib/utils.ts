import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function timeAgo(dateStr: string) {
	const now = new Date();
	const date = new Date(dateStr);
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
	return formatDate(dateStr);
}

// ── Calendar helpers ──

export function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
	return new Date(year, month, 1).getDay();
}

export function formatMonthYear(year: number, month: number) {
	return new Date(year, month).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});
}

export function getWeekDates(date: Date): Date[] {
	const start = new Date(date);
	start.setDate(start.getDate() - start.getDay());
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start);
		d.setDate(d.getDate() + i);
		return d;
	});
}

export function toDateString(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

// ── Greeting ──

const greetingSubtexts = [
	"Let's get after it.",
	"Time to build.",
	"Another day, another feature.",
	"What's on the agenda?",
	"Let's make moves.",
	"Ready to ship?",
	"Big things happening.",
	"Let's cook.",
	"Locked in.",
	"Grind mode activated.",
];

export function getGreeting(user: User) {
	const hour = new Date().getHours();
	let greeting: string;
	if (hour < 12) greeting = "Good morning";
	else if (hour < 17) greeting = "Good afternoon";
	else greeting = "Good evening";

	const subtext =
		greetingSubtexts[Math.floor(Math.random() * greetingSubtexts.length)];
	return { greeting: `${greeting}, ${capitalize(user)}`, subtext };
}

// ── Currency ──

export function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}
