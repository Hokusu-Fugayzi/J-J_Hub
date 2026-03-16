import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Tasks } from "@/pages/Tasks";
import { Notes } from "@/pages/Notes";

function ProtectedRoutes() {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	return <Layout />;
}

function LoginRoute() {
	const { user } = useAuth();
	if (user) return <Navigate to="/" replace />;
	return <Login />;
}

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<LoginRoute />} />
					<Route element={<ProtectedRoutes />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/projects" element={<Projects />} />
						<Route path="/tasks" element={<Tasks />} />
						<Route path="/notes" element={<Notes />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
