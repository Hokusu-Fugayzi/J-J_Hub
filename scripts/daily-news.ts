/**
 * Daily News Generator for JAPJU
 * Fetches work activity + external news and posts to the news feed.
 * Run: npx tsx scripts/daily-news.ts
 * Schedule: via Claude Code scheduled triggers or cron
 */

const SUPABASE_URL = "https://ijlbmltbsgbkzycdcbhb.supabase.co";
const SUPABASE_KEY = "sb_publishable_FOc70qTngyqex7SqyH-aRg_lYmSopUk";

const headers = {
	apikey: SUPABASE_KEY,
	Authorization: `Bearer ${SUPABASE_KEY}`,
	"Content-Type": "application/json",
};

// ── Supabase helpers ──

async function supabaseGet(table: string, params = "") {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
		headers,
	});
	return res.json();
}

async function postNews(
	title: string,
	content: string,
	category: string,
	url?: string,
) {
	await fetch(`${SUPABASE_URL}/rest/v1/news_posts`, {
		method: "POST",
		headers: { ...headers, Prefer: "return=minimal" },
		body: JSON.stringify({
			title,
			content,
			author: "jonah",
			category,
			pinned: false,
			url: url || null,
		}),
	});
}

// ── Work news: summarize recent activity ──

async function generateWorkNews() {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const since = yesterday.toISOString();

	// Recent tasks
	const tasks = await supabaseGet(
		"tasks",
		`updated_at=gte.${since}&order=updated_at.desc&limit=20`,
	);
	const done = tasks.filter((t: any) => t.status === "done");
	const inProgress = tasks.filter((t: any) => t.status === "in-progress");

	// Recent deals
	const deals = await supabaseGet(
		"deals",
		`updated_at=gte.${since}&order=updated_at.desc&limit=10`,
	);

	if (done.length === 0 && inProgress.length === 0 && deals.length === 0) {
		return; // Nothing to report
	}

	let content = "";

	if (done.length > 0) {
		content += `**Completed (${done.length}):**\n`;
		for (const t of done.slice(0, 5)) {
			content += `- ${t.title}\n`;
		}
		content += "\n";
	}

	if (inProgress.length > 0) {
		content += `**In Progress (${inProgress.length}):**\n`;
		for (const t of inProgress.slice(0, 5)) {
			content += `- ${t.title}\n`;
		}
		content += "\n";
	}

	if (deals.length > 0) {
		content += `**Deal Activity:**\n`;
		for (const d of deals.slice(0, 5)) {
			const value = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 0,
			}).format(d.value);
			content += `- ${d.name} (${d.stage}) — ${value}\n`;
		}
	}

	const title = `Work Update — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
	await postNews(title, content.trim(), "update");
	console.log("Posted work news");
}

// ── External news from RSS feeds ──

interface RSSItem {
	title: string;
	link: string;
	category: string;
}

async function fetchRSS(url: string): Promise<RSSItem[]> {
	try {
		const res = await fetch(url, {
			headers: { "User-Agent": "JAPJU-NewsBot/1.0" },
		});
		const text = await res.text();

		// Simple XML parsing for RSS items
		const items: RSSItem[] = [];
		const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

		for (const item of itemMatches.slice(0, 5)) {
			const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
			const linkMatch = item.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
			if (titleMatch && linkMatch) {
				items.push({
					title: titleMatch[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
					link: linkMatch[1],
					category: "link",
				});
			}
		}
		return items;
	} catch (e) {
		console.error(`Failed to fetch RSS from ${url}:`, e);
		return [];
	}
}

async function generateExternalNews() {
	const feeds: { name: string; url: string; section: string }[] = [
		// World / Geopolitics
		{
			name: "Reuters Top News",
			url: "https://feeds.reuters.com/reuters/topNews",
			section: "World",
		},
		{
			name: "AP News",
			url: "https://rsshub.app/apnews/topics/apf-topnews",
			section: "World",
		},
		// Finance
		{
			name: "CNBC Top",
			url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
			section: "Finance",
		},
		// Sports
		{
			name: "ESPN Top",
			url: "https://www.espn.com/espn/rss/news",
			section: "Sports",
		},
		// Tech
		{
			name: "TechCrunch",
			url: "https://techcrunch.com/feed/",
			section: "Tech",
		},
	];

	const allItems: { section: string; items: RSSItem[] }[] = [];

	for (const feed of feeds) {
		const items = await fetchRSS(feed.url);
		if (items.length > 0) {
			allItems.push({ section: feed.section, items: items.slice(0, 3) });
		}
	}

	if (allItems.length === 0) {
		console.log("No external news fetched");
		return;
	}

	// Group by section
	const sections = new Map<string, RSSItem[]>();
	for (const { section, items } of allItems) {
		const existing = sections.get(section) || [];
		sections.set(section, [...existing, ...items]);
	}

	let content = "";
	for (const [section, items] of sections) {
		content += `**${section}:**\n`;
		for (const item of items.slice(0, 4)) {
			content += `- [${item.title}](${item.link})\n`;
		}
		content += "\n";
	}

	const today = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
	const title = `Daily Briefing — ${today}`;
	await postNews(title, content.trim(), "announcement");
	console.log("Posted daily briefing");
}

// ── Main ──

async function main() {
	console.log("Generating daily news...");

	try {
		await generateWorkNews();
	} catch (e) {
		console.error("Work news failed:", e);
	}

	try {
		await generateExternalNews();
	} catch (e) {
		console.error("External news failed:", e);
	}

	console.log("Done!");
}

main();
