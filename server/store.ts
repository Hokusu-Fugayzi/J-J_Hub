import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "..", "data.json");

export interface StoreData {
	projects: any[];
	tasks: any[];
	notes: any[];
	events: any[];
	sprints: any[];
	standups: any[];
	contacts: any[];
	deals: any[];
	"contact-activities": any[];
	news: any[];
	moods: any[];
}

const DEFAULT_DATA: StoreData = {
	projects: [
		{
			id: "seed-1",
			name: "KyberCore",
			description: "Parent company — Griftr, Turfy, Cosmo",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-2",
			name: "Griftr",
			description: "KyberCore project",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-3",
			name: "Turfy",
			description: "KyberCore project — AI-native lawn care platform",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-4",
			name: "Cosmo",
			description: "KyberCore project",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-5",
			name: "TAT",
			description: "Parent company — WNC, Jericho, Jordan",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-6",
			name: "WNC Project",
			description: "TAT project",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-7",
			name: "Jericho",
			description: "TAT project",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			id: "seed-8",
			name: "Jordan",
			description: "TAT project",
			status: "active",
			assigned_to: "both",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
	],
	tasks: [],
	notes: [],
	events: [],
	sprints: [],
	standups: [],
	contacts: [],
	deals: [],
	"contact-activities": [],
	news: [],
	moods: [],
};

function loadData(): StoreData {
	if (!existsSync(DATA_FILE)) {
		writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
		return structuredClone(DEFAULT_DATA);
	}
	return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data: StoreData) {
	writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getAll(collection: keyof StoreData): any[] {
	const data = loadData();
	return data[collection] || [];
}

export function getById(collection: keyof StoreData, id: string): any | null {
	const items = getAll(collection);
	return items.find((item: any) => item.id === id) || null;
}

export function create(collection: keyof StoreData, item: any): any {
	const data = loadData();
	const newItem = {
		...item,
		id: crypto.randomUUID(),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	if (!data[collection]) data[collection] = [];
	data[collection].push(newItem);
	saveData(data);
	return newItem;
}

export function update(
	collection: keyof StoreData,
	id: string,
	updates: any,
): any | null {
	const data = loadData();
	const items = data[collection] || [];
	const idx = items.findIndex((item: any) => item.id === id);
	if (idx === -1) return null;
	items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
	saveData(data);
	return items[idx];
}

export function remove(collection: keyof StoreData, id: string): boolean {
	const data = loadData();
	const items = data[collection] || [];
	const before = items.length;
	data[collection] = items.filter((item: any) => item.id !== id);
	saveData(data);
	return data[collection].length < before;
}
