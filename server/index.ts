import express from "express";
import { getAll, getById, create, update, remove } from "./store.js";
import type { StoreData } from "./store.js";

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.JJ_API_KEY || "jj_dev_key_2026";

// ── Middleware ──

app.use(express.json());

// CORS for local dev
app.use((_req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	if (_req.method === "OPTIONS") {
		res.sendStatus(200);
		return;
	}
	next();
});

// Auth check
app.use("/api", (req, res, next) => {
	const auth = req.headers.authorization;
	if (!auth || auth !== `Bearer ${API_KEY}`) {
		res.status(401).json({ error: "Unauthorized. Pass Authorization: Bearer <api_key>" });
		return;
	}
	next();
});

// ── Entity routes ──

const COLLECTIONS: (keyof StoreData)[] = [
	"projects",
	"tasks",
	"notes",
	"events",
	"sprints",
	"standups",
	"contacts",
	"deals",
	"contact-activities",
	"news",
	"moods",
];

// GET /api/:collection — list all items
app.get("/api/:collection", (req, res) => {
	const collection = req.params.collection as keyof StoreData;
	if (!COLLECTIONS.includes(collection)) {
		res.status(404).json({ error: `Unknown collection: ${collection}` });
		return;
	}
	const items = getAll(collection);

	// Optional query filters
	let filtered = items;
	const { status, assigned_to, project_id, sprint_id, stage, contact_id, user, date, search } =
		req.query;
	if (status) filtered = filtered.filter((i: any) => i.status === status);
	if (assigned_to)
		filtered = filtered.filter(
			(i: any) => i.assigned_to === assigned_to || i.assigned_to === "both",
		);
	if (project_id) filtered = filtered.filter((i: any) => i.project_id === project_id);
	if (sprint_id) filtered = filtered.filter((i: any) => i.sprint_id === sprint_id);
	if (stage) filtered = filtered.filter((i: any) => i.stage === stage);
	if (contact_id) filtered = filtered.filter((i: any) => i.contact_id === contact_id);
	if (user) filtered = filtered.filter((i: any) => i.user === user);
	if (date) filtered = filtered.filter((i: any) => i.date === date);
	if (search) {
		const q = (search as string).toLowerCase();
		filtered = filtered.filter(
			(i: any) =>
				(i.name && i.name.toLowerCase().includes(q)) ||
				(i.title && i.title.toLowerCase().includes(q)) ||
				(i.company && i.company.toLowerCase().includes(q)),
		);
	}

	res.json(filtered);
});

// GET /api/:collection/:id — get single item
app.get("/api/:collection/:id", (req, res) => {
	const collection = req.params.collection as keyof StoreData;
	if (!COLLECTIONS.includes(collection)) {
		res.status(404).json({ error: `Unknown collection: ${collection}` });
		return;
	}
	const item = getById(collection, req.params.id);
	if (!item) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json(item);
});

// POST /api/:collection — create item
app.post("/api/:collection", (req, res) => {
	const collection = req.params.collection as keyof StoreData;
	if (!COLLECTIONS.includes(collection)) {
		res.status(404).json({ error: `Unknown collection: ${collection}` });
		return;
	}
	const item = create(collection, req.body);
	res.status(201).json(item);
});

// PATCH /api/:collection/:id — update item
app.patch("/api/:collection/:id", (req, res) => {
	const collection = req.params.collection as keyof StoreData;
	if (!COLLECTIONS.includes(collection)) {
		res.status(404).json({ error: `Unknown collection: ${collection}` });
		return;
	}
	const item = update(collection, req.params.id, req.body);
	if (!item) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json(item);
});

// DELETE /api/:collection/:id — delete item
app.delete("/api/:collection/:id", (req, res) => {
	const collection = req.params.collection as keyof StoreData;
	if (!COLLECTIONS.includes(collection)) {
		res.status(404).json({ error: `Unknown collection: ${collection}` });
		return;
	}
	const deleted = remove(collection, req.params.id);
	if (!deleted) {
		res.status(404).json({ error: "Not found" });
		return;
	}
	res.json({ ok: true });
});

// ── Health check ──
app.get("/health", (_req, res) => {
	res.json({ status: "ok", collections: COLLECTIONS });
});

// ── Start ──

app.listen(PORT, () => {
	console.log(`J&J Hub API running on http://localhost:${PORT}`);
	console.log(`API Key: ${API_KEY}`);
	console.log(`\nEndpoints:`);
	console.log(`  GET    /api/{collection}       — list items`);
	console.log(`  GET    /api/{collection}/:id   — get item`);
	console.log(`  POST   /api/{collection}       — create item`);
	console.log(`  PATCH  /api/{collection}/:id   — update item`);
	console.log(`  DELETE /api/{collection}/:id   — delete item`);
	console.log(`\nCollections: ${COLLECTIONS.join(", ")}`);
	console.log(`\nUsage: curl -H "Authorization: Bearer ${API_KEY}" http://localhost:${PORT}/api/tasks`);
});
