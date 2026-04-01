import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Notes } from "@/pages/Notes";
import { Calendar } from "@/pages/Calendar";
import { News } from "@/pages/News";
import { Contacts } from "@/pages/Contacts";
import { Deals } from "@/pages/Deals";
import { Pipeline } from "@/pages/Pipeline";
import { Sprints } from "@/pages/Sprints";
import { Board } from "@/pages/Board";
import { Standups } from "@/pages/Standups";
import { Fitness } from "@/pages/Fitness";

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
						<Route path="/calendar" element={<Calendar />} />
						<Route path="/news" element={<News />} />
						<Route path="/projects" element={<Projects />} />
							<Route path="/board" element={<Board />} />
						<Route path="/sprints" element={<Sprints />} />
						<Route path="/standups" element={<Standups />} />
						<Route path="/contacts" element={<Contacts />} />
						<Route path="/deals" element={<Deals />} />
						<Route path="/pipeline" element={<Pipeline />} />
						<Route path="/notes" element={<Notes />} />
						<Route path="/fitness" element={<Fitness />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
