import { useEffect, useState } from "react";
import {
	getNewsPosts,
	createNewsPost,
	updateNewsPost,
	deleteNewsPost,
} from "@/lib/data";
import { capitalize, timeAgo } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { NewsPost } from "@/types";
import { Plus, Trash2, X, Pencil, Pin, ExternalLink } from "lucide-react";

const CATEGORIES = ["announcement", "update", "idea", "link"] as const;

const categoryColors: Record<string, string> = {
	announcement: "bg-red-100 text-red-700",
	update: "bg-blue-100 text-blue-700",
	idea: "bg-purple-100 text-purple-700",
	link: "bg-green-100 text-green-700",
};

export function News() {
	const { user } = useAuth();
	const [posts, setPosts] = useState<NewsPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [editing, setEditing] = useState<NewsPost | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [filterCategory, setFilterCategory] = useState<string>("all");

	const load = () => {
		getNewsPosts()
			.then(setPosts)
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this post?")) return;
		await deleteNewsPost(id);
		load();
	};

	const togglePin = async (post: NewsPost) => {
		await updateNewsPost(post.id, { pinned: !post.pinned });
		load();
	};

	const filtered =
		filterCategory === "all"
			? posts
			: posts.filter((p) => p.category === filterCategory);

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
					<h1 className="text-2xl font-bold">News</h1>
					<p className="text-muted-foreground text-sm">
						Updates, ideas, and announcements
					</p>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setShowForm(true);
					}}
					className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
				>
					<Plus className="w-4 h-4" /> New Post
				</button>
			</div>

			<div className="flex gap-2 mb-4">
				<button
					onClick={() => setFilterCategory("all")}
					className={`px-3 py-1.5 rounded-md text-sm ${filterCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
				>
					All
				</button>
				{CATEGORIES.map((cat) => (
					<button
						key={cat}
						onClick={() => setFilterCategory(cat)}
						className={`px-3 py-1.5 rounded-md text-sm ${filterCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
					>
						{capitalize(cat)}
					</button>
				))}
			</div>

			{showForm && (
				<PostForm
					post={editing}
					currentUser={user!}
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
				{filtered.map((post) => (
					<div
						key={post.id}
						className={`border rounded-lg p-4 group ${post.pinned ? "border-primary/40 bg-primary/5" : "border-border"}`}
					>
						<div className="flex items-start justify-between">
							<button
								onClick={() =>
									setExpandedId(expandedId === post.id ? null : post.id)
								}
								className="text-left flex-1"
							>
								<div className="flex items-center gap-2">
									{post.pinned && (
										<Pin className="w-3.5 h-3.5 text-primary" />
									)}
									<h3 className="font-semibold text-sm">{post.title}</h3>
									<span
										className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[post.category]}`}
									>
										{post.category}
									</span>
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
									<span>{capitalize(post.author)}</span>
									<span>&middot;</span>
									<span>{timeAgo(post.created_at)}</span>
								</div>
							</button>
							<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => togglePin(post)}
									className="p-1.5 rounded hover:bg-accent"
									title={post.pinned ? "Unpin" : "Pin"}
								>
									<Pin
										className={`w-3.5 h-3.5 ${post.pinned ? "text-primary" : "text-muted-foreground"}`}
									/>
								</button>
								<button
									onClick={() => {
										setEditing(post);
										setShowForm(true);
									}}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
								<button
									onClick={() => handleDelete(post.id)}
									className="p-1.5 rounded hover:bg-accent"
								>
									<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
							</div>
						</div>
						{expandedId === post.id && (
							<div className="mt-3 pt-3 border-t border-border text-sm whitespace-pre-wrap">
								{post.content || "No content"}
								{post.url && (
									<a
										href={post.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 mt-2 text-blue-600 hover:underline"
									>
										<ExternalLink className="w-3.5 h-3.5" />
										{post.url}
									</a>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			{filtered.length === 0 && !showForm && (
				<div className="text-center py-12 text-muted-foreground">
					<p className="mb-2">No posts yet</p>
					<button
						onClick={() => setShowForm(true)}
						className="text-sm underline"
					>
						Create the first post
					</button>
				</div>
			)}
		</div>
	);
}

function PostForm({
	post,
	currentUser,
	onSave,
	onCancel,
}: {
	post: NewsPost | null;
	currentUser: string;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [title, setTitle] = useState(post?.title || "");
	const [content, setContent] = useState(post?.content || "");
	const [category, setCategory] = useState<string>(
		post?.category || "update",
	);
	const [url, setUrl] = useState(post?.url || "");
	const [pinned, setPinned] = useState(post?.pinned || false);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		if (post) {
			await updateNewsPost(post.id, {
				title,
				content,
				category: category as NewsPost["category"],
				url: url || null,
				pinned,
			});
		} else {
			await createNewsPost({
				title,
				content,
				author: currentUser as NewsPost["author"],
				category: category as NewsPost["category"],
				url: url || null,
				pinned,
			});
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
					{post ? "Edit Post" : "New Post"}
				</h3>
				<button type="button" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</button>
			</div>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Post title"
				required
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="What's the news?"
				rows={4}
				className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
			/>
			<div className="flex gap-3 items-center">
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="px-3 py-2 border border-input rounded-md text-sm bg-background"
				>
					{CATEGORIES.map((cat) => (
						<option key={cat} value={cat}>
							{capitalize(cat)}
						</option>
					))}
				</select>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={pinned}
						onChange={(e) => setPinned(e.target.checked)}
						className="rounded"
					/>
					Pin post
				</label>
			</div>
			{category === "link" && (
				<input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://..."
					className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			)}
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
					disabled={saving || !title}
					className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
				>
					{saving ? "Saving..." : post ? "Update" : "Post"}
				</button>
			</div>
		</form>
	);
}
