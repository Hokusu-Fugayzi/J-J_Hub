import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import type { User } from "@/types";

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => boolean;
	logout: () => void;
}

const USERS: Record<string, { password: string; user: User }> = {
	jonah: { password: "jonah123", user: "jonah" },
	julian: { password: "julian123", user: "julian" },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => {
		const saved = localStorage.getItem("jj-user");
		return saved ? (saved as User) : null;
	});

	useEffect(() => {
		if (user) {
			localStorage.setItem("jj-user", user);
		} else {
			localStorage.removeItem("jj-user");
		}
	}, [user]);

	const login = (username: string, password: string): boolean => {
		const entry = USERS[username.toLowerCase()];
		if (entry && entry.password === password) {
			setUser(entry.user);
			return true;
		}
		return false;
	};

	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
