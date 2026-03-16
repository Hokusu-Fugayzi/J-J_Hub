import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function Login() {
	const { login } = useAuth();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!login(username, password)) {
			setError("Invalid username or password");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<div className="w-full max-w-sm border border-border rounded-lg bg-card p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-center mb-1">J&J Hub</h1>
				<p className="text-sm text-muted-foreground text-center mb-6">
					Sign in to manage your projects
				</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="text-sm font-medium block mb-1">Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="jonah or julian"
						/>
					</div>
					<div>
						<label className="text-sm font-medium block mb-1">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<button
						type="submit"
						className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
					>
						Sign in
					</button>
				</form>
			</div>
		</div>
	);
}
