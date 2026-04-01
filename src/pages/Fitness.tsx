import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
	getWorkoutLogs,
	createWorkoutLog,
	getWaterLog,
	upsertWaterLog,
	getDailyCheckIn,
	upsertDailyCheckIn,
	getWeighIns,
	createWeighIn,
	getCheckInHistory,
} from "@/lib/data";
import { toDateString } from "@/lib/utils";
import type {
	WorkoutRoutine,
	WorkoutLog,
	WaterLog,
	DailyCheckIn,
	WeighIn,
} from "@/types";
import {
	Dumbbell,
	Droplets,
	Scale,
	Flame,
	ChevronDown,
	ChevronUp,
	Check,
	Plus,
	Minus,
	TrendingDown,
	Wine,
	BedDouble,
	Activity,
	AlertCircle,
	Clock,
} from "lucide-react";

// ── Jonah's Routine ──
// 6'0", 203 lbs, goal: lose ~10 lbs of belly fat
// Clean eater, whisky ~4 nights/week (1 glass), no drastic diet changes
// Strategy: 4-day strength split + 2 active recovery/cardio days, 1 rest day
// Compound movements for calorie burn + muscle retention

const JONAH_ROUTINES: WorkoutRoutine[] = [
	{
		user: "jonah",
		day: "monday",
		name: "Upper Body Push + Core",
		focus: "Chest, shoulders, triceps, core",
		exercises: [
			{ name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
			{ name: "Overhead Press", sets: 3, reps: "8-10", rest: "90s" },
			{ name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" },
			{ name: "Lateral Raises", sets: 3, reps: "12-15", rest: "45s" },
			{ name: "Tricep Dips", sets: 3, reps: "10-12", rest: "60s" },
			{ name: "Cable Crunches", sets: 3, reps: "15-20", rest: "45s" },
			{ name: "Hanging Leg Raises", sets: 3, reps: "12-15", rest: "45s" },
			{ name: "Plank Hold", sets: 3, reps: "45-60s", rest: "30s" },
		],
	},
	{
		user: "jonah",
		day: "tuesday",
		name: "Lower Body Strength",
		focus: "Quads, hamstrings, glutes, calves",
		exercises: [
			{ name: "Barbell Squats", sets: 4, reps: "6-8", rest: "2min" },
			{ name: "Romanian Deadlifts", sets: 3, reps: "8-10", rest: "90s" },
			{ name: "Bulgarian Split Squats", sets: 3, reps: "10/leg", rest: "60s" },
			{ name: "Leg Press", sets: 3, reps: "10-12", rest: "60s" },
			{ name: "Leg Curls", sets: 3, reps: "12-15", rest: "45s" },
			{ name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s" },
		],
	},
	{
		user: "jonah",
		day: "wednesday",
		name: "Active Recovery + Cardio",
		focus: "Fat burn, mobility, recovery",
		exercises: [
			{ name: "Incline Treadmill Walk", sets: 1, reps: "30 min @ 3.5mph, 10-12% incline", rest: "—", notes: "Great belly fat burner" },
			{ name: "Foam Rolling", sets: 1, reps: "10 min full body", rest: "—" },
			{ name: "Hip Flexor Stretches", sets: 2, reps: "60s/side", rest: "—" },
			{ name: "Dead Hang", sets: 3, reps: "30-45s", rest: "30s", notes: "Decompress spine" },
			{ name: "Light Ab Circuit", sets: 2, reps: "10 each: bicycle crunches, mountain climbers, flutter kicks", rest: "30s" },
		],
	},
	{
		user: "jonah",
		day: "thursday",
		name: "Upper Body Pull + Core",
		focus: "Back, biceps, rear delts, core",
		exercises: [
			{ name: "Deadlifts", sets: 4, reps: "5-6", rest: "2min" },
			{ name: "Weighted Pull-Ups", sets: 3, reps: "6-8", rest: "90s", notes: "Or bodyweight to failure" },
			{ name: "Barbell Rows", sets: 3, reps: "8-10", rest: "90s" },
			{ name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s" },
			{ name: "Barbell Curls", sets: 3, reps: "10-12", rest: "60s" },
			{ name: "Hammer Curls", sets: 3, reps: "10-12", rest: "45s" },
			{ name: "Ab Wheel Rollouts", sets: 3, reps: "10-12", rest: "45s" },
			{ name: "Russian Twists", sets: 3, reps: "20 total", rest: "30s" },
		],
	},
	{
		user: "jonah",
		day: "friday",
		name: "Full Body HIIT + Conditioning",
		focus: "Metabolic conditioning, fat burn",
		exercises: [
			{ name: "Kettlebell Swings", sets: 4, reps: "15", rest: "30s" },
			{ name: "Box Jumps", sets: 3, reps: "10", rest: "45s" },
			{ name: "Battle Ropes", sets: 3, reps: "30s on / 30s off", rest: "30s" },
			{ name: "Farmer's Walks", sets: 3, reps: "40 yards", rest: "60s" },
			{ name: "Burpees", sets: 3, reps: "10", rest: "45s" },
			{ name: "Sled Push", sets: 3, reps: "30 yards", rest: "60s", notes: "Or heavy incline treadmill sprint" },
			{ name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s" },
		],
	},
	{
		user: "jonah",
		day: "saturday",
		name: "Active Recovery + Light Cardio",
		focus: "Zone 2 cardio, flexibility",
		exercises: [
			{ name: "Steady-State Cardio", sets: 1, reps: "30-45 min (jog, bike, or swim)", rest: "—", notes: "Keep heart rate 120-140bpm" },
			{ name: "Yoga / Stretching", sets: 1, reps: "15-20 min", rest: "—" },
			{ name: "Core Stability", sets: 2, reps: "Side planks 30s/side + bird dogs 10/side", rest: "—" },
		],
	},
	{
		user: "jonah",
		day: "sunday",
		name: "Rest Day",
		focus: "Full recovery — walk if you feel like it",
		exercises: [
			{ name: "Walk", sets: 1, reps: "20-30 min easy pace", rest: "—", notes: "Optional but encouraged" },
			{ name: "Foam Roll / Stretch", sets: 1, reps: "10-15 min", rest: "—", notes: "Focus on tight areas" },
		],
	},
];

// Julian's placeholder routine (to be customized)
const JULIAN_ROUTINES: WorkoutRoutine[] = [
	{
		user: "julian",
		day: "monday",
		name: "Coming Soon",
		focus: "Julian's routine will be customized",
		exercises: [],
	},
];

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_LABELS: Record<string, string> = {
	monday: "Mon", tuesday: "Tue", wednesday: "Wed",
	thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const WATER_GOAL = 12; // glasses (8oz each = 96oz ~ good for 200lb guy)

// Water reminder intervals
const WATER_REMINDERS = [
	"7:00 AM — Wake up glass",
	"9:00 AM — Mid-morning",
	"11:00 AM — Pre-lunch",
	"12:30 PM — With lunch",
	"2:30 PM — Afternoon",
	"4:30 PM — Pre-workout",
	"6:00 PM — Post-workout",
	"8:00 PM — Evening",
];

const NUTRITION_TIPS = [
	"Add protein to every meal — keeps you full & preserves muscle during fat loss",
	"Skip the sugary mixers if you're having whisky — neat/rocks is the move",
	"1 glass of whisky = ~100 cal. 4x/week = ~400 cal. Not a dealbreaker, just be aware",
	"Front-load your carbs earlier in the day when you're most active",
	"Eat a solid meal 1-2 hours before lifting — don't train fasted",
	"Get 180-200g protein daily at your weight (chicken, fish, eggs, greek yogurt)",
	"Swap one weeknight whisky for herbal tea — small win, big compounding effect",
];

export function Fitness() {
	const { user } = useAuth();
	const today = toDateString(new Date());
	const dayOfWeek = DAYS[new Date().getDay()];

	const [loading, setLoading] = useState(true);
	const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
	const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
	const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
	const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
	const [checkInHistory, setCheckInHistory] = useState<DailyCheckIn[]>([]);
	const [expandedDay, setExpandedDay] = useState<string | null>(dayOfWeek);
	const [showLogWorkout, setShowLogWorkout] = useState(false);
	const [showWeighIn, setShowWeighIn] = useState(false);
	const [showCheckIn, setShowCheckIn] = useState(false);
	const [tipIndex, setTipIndex] = useState(0);

	// Log workout form state
	const [logDuration, setLogDuration] = useState(60);
	const [logEnergy, setLogEnergy] = useState<1 | 2 | 3 | 4 | 5>(3);
	const [logNotes, setLogNotes] = useState("");
	const [logExercises, setLogExercises] = useState<string[]>([]);

	// Weigh-in form
	const [newWeight, setNewWeight] = useState("");

	// Check-in form
	const [checkWeight, setCheckWeight] = useState("");
	const [checkSleep, setCheckSleep] = useState("");
	const [checkSoreness, setCheckSoreness] = useState<1 | 2 | 3 | 4 | 5>(3);
	const [checkWorkedOut, setCheckWorkedOut] = useState(false);
	const [checkAlcohol, setCheckAlcohol] = useState(false);
	const [checkNotes, setCheckNotes] = useState("");

	const routines = user === "jonah" ? JONAH_ROUTINES : JULIAN_ROUTINES;
	const todayRoutine = routines.find((r) => r.day === dayOfWeek);

	const loadData = useCallback(async () => {
		try {
			const [water, checkIn, weights, logs, history] = await Promise.all([
				getWaterLog(user!, today),
				getDailyCheckIn(user!, today),
				getWeighIns(user!),
				getWorkoutLogs({ user: user! }),
				getCheckInHistory(user!),
			]);
			setWaterLog(water);
			setTodayCheckIn(checkIn);
			setWeighIns(weights);
			setWorkoutLogs(logs);
			setCheckInHistory(history);
		} finally {
			setLoading(false);
		}
	}, [user, today]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTipIndex((i) => (i + 1) % NUTRITION_TIPS.length);
		}, 8000);
		return () => clearInterval(interval);
	}, []);

	const handleWater = async (delta: number) => {
		const current = waterLog?.glasses ?? 0;
		const next = Math.max(0, current + delta);
		const updated = await upsertWaterLog({
			user: user!,
			date: today,
			glasses: next,
			goal: WATER_GOAL,
		});
		setWaterLog(updated);
	};

	const handleLogWorkout = async () => {
		await createWorkoutLog({
			user: user!,
			date: today,
			routine_day: todayRoutine?.name ?? dayOfWeek,
			exercises_completed: logExercises,
			duration_minutes: logDuration,
			energy_level: logEnergy,
			notes: logNotes,
		});
		setShowLogWorkout(false);
		setLogNotes("");
		setLogExercises([]);
		loadData();
	};

	const handleWeighIn = async () => {
		if (!newWeight) return;
		await createWeighIn({
			user: user!,
			date: today,
			weight: parseFloat(newWeight),
		});
		setNewWeight("");
		setShowWeighIn(false);
		loadData();
	};

	const handleCheckIn = async () => {
		await upsertDailyCheckIn({
			user: user!,
			date: today,
			weight: checkWeight ? parseFloat(checkWeight) : null,
			sleep_hours: checkSleep ? parseFloat(checkSleep) : null,
			soreness: checkSoreness,
			worked_out: checkWorkedOut,
			hit_water_goal: (waterLog?.glasses ?? 0) >= WATER_GOAL,
			alcohol: checkAlcohol,
			notes: checkNotes,
		});
		setShowCheckIn(false);
		loadData();
	};

	const toggleExercise = (name: string) => {
		setLogExercises((prev) =>
			prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name],
		);
	};

	const waterPercent = Math.min(100, ((waterLog?.glasses ?? 0) / WATER_GOAL) * 100);
	const currentGlasses = waterLog?.glasses ?? 0;

	// Streak calculation from check-in history
	let streak = 0;
	for (const c of checkInHistory) {
		if (c.worked_out) streak++;
		else break;
	}

	// Weight trend
	const startWeight = user === "jonah" ? 203 : null;
	const latestWeight = weighIns[0]?.weight ?? startWeight;
	const weightChange = startWeight && latestWeight ? (latestWeight - startWeight).toFixed(1) : null;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Dumbbell className="w-6 h-6 text-primary" />
					Fitness Tracker
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{user === "jonah"
						? "6'0\" · Goal: 193 lbs · Lose belly fat · Keep it sustainable"
						: "Julian's fitness dashboard"}
				</p>
			</div>

			{/* Quick Stats Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="bg-card border border-border rounded-lg p-3 text-center">
					<Scale className="w-5 h-5 mx-auto mb-1 text-primary" />
					<p className="text-lg font-bold">{latestWeight ?? "—"}</p>
					<p className="text-xs text-muted-foreground">Current lbs</p>
					{weightChange && (
						<p className={`text-xs font-medium mt-0.5 ${parseFloat(weightChange) <= 0 ? "text-green-600" : "text-red-500"}`}>
							{parseFloat(weightChange) <= 0 ? "↓" : "↑"} {Math.abs(parseFloat(weightChange))} lbs
						</p>
					)}
				</div>
				<div className="bg-card border border-border rounded-lg p-3 text-center">
					<Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
					<p className="text-lg font-bold">{currentGlasses}/{WATER_GOAL}</p>
					<p className="text-xs text-muted-foreground">Glasses today</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-3 text-center">
					<Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
					<p className="text-lg font-bold">{streak}</p>
					<p className="text-xs text-muted-foreground">Day streak</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-3 text-center">
					<Activity className="w-5 h-5 mx-auto mb-1 text-green-500" />
					<p className="text-lg font-bold">{workoutLogs.length}</p>
					<p className="text-xs text-muted-foreground">Total workouts</p>
				</div>
			</div>

			{/* Today's Workout */}
			{todayRoutine && (
				<div className="bg-card border border-border rounded-lg overflow-hidden">
					<div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium text-primary uppercase tracking-wider">Today's Workout</p>
								<h2 className="text-lg font-bold">{todayRoutine.name}</h2>
								<p className="text-sm text-muted-foreground">{todayRoutine.focus}</p>
							</div>
							{todayRoutine.exercises.length > 0 && (
								<button
									onClick={() => {
										setShowLogWorkout(!showLogWorkout);
										if (!showLogWorkout) {
											setLogExercises([]);
										}
									}}
									className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
								>
									{showLogWorkout ? "Cancel" : "Log Workout"}
								</button>
							)}
						</div>
					</div>

					{todayRoutine.exercises.length > 0 ? (
						<div className="divide-y divide-border">
							{todayRoutine.exercises.map((ex, i) => (
								<div
									key={i}
									className={`px-4 py-3 flex items-center gap-3 ${
										showLogWorkout ? "cursor-pointer hover:bg-accent/50" : ""
									} ${logExercises.includes(ex.name) ? "bg-green-50" : ""}`}
									onClick={() => showLogWorkout && toggleExercise(ex.name)}
								>
									{showLogWorkout && (
										<div
											className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
												logExercises.includes(ex.name)
													? "bg-green-500 border-green-500 text-white"
													: "border-border"
											}`}
										>
											{logExercises.includes(ex.name) && <Check className="w-3 h-3" />}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm">{ex.name}</p>
										{ex.notes && (
											<p className="text-xs text-muted-foreground italic">{ex.notes}</p>
										)}
									</div>
									<div className="text-right text-xs text-muted-foreground flex-shrink-0">
										<p>{ex.sets} × {ex.reps}</p>
										<p>Rest: {ex.rest}</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="px-4 py-8 text-center text-muted-foreground">
							<p>Rest day — take it easy and recover</p>
						</div>
					)}

					{/* Log workout form */}
					{showLogWorkout && (
						<div className="border-t border-border px-4 py-4 space-y-3 bg-muted/30">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="text-xs font-medium text-muted-foreground">Duration (min)</label>
									<input
										type="number"
										value={logDuration}
										onChange={(e) => setLogDuration(parseInt(e.target.value) || 0)}
										className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
									/>
								</div>
								<div>
									<label className="text-xs font-medium text-muted-foreground">Energy Level</label>
									<div className="flex gap-1 mt-1">
										{([1, 2, 3, 4, 5] as const).map((n) => (
											<button
												key={n}
												onClick={() => setLogEnergy(n)}
												className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
													logEnergy === n
														? "bg-primary text-primary-foreground"
														: "bg-background border border-border hover:bg-accent"
												}`}
											>
												{n}
											</button>
										))}
									</div>
								</div>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">Notes</label>
								<input
									type="text"
									value={logNotes}
									onChange={(e) => setLogNotes(e.target.value)}
									placeholder="How'd it go?"
									className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
								/>
							</div>
							<button
								onClick={handleLogWorkout}
								className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								Save Workout ({logExercises.length}/{todayRoutine.exercises.length} exercises)
							</button>
						</div>
					)}
				</div>
			)}

			{/* Water Tracker */}
			<div className="bg-card border border-border rounded-lg p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<Droplets className="w-5 h-5 text-blue-500" />
						<h2 className="font-semibold">Water Intake</h2>
					</div>
					<span className="text-sm text-muted-foreground">
						Goal: {WATER_GOAL} glasses (96 oz)
					</span>
				</div>

				{/* Progress bar */}
				<div className="w-full bg-blue-100 rounded-full h-4 mb-3 overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out"
						style={{ width: `${waterPercent}%` }}
					/>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							onClick={() => handleWater(-1)}
							disabled={currentGlasses <= 0}
							className="p-2 rounded-md border border-border hover:bg-accent disabled:opacity-30 transition-colors"
						>
							<Minus className="w-4 h-4" />
						</button>
						<span className="text-2xl font-bold min-w-[3ch] text-center">
							{currentGlasses}
						</span>
						<button
							onClick={() => handleWater(1)}
							className="p-2 rounded-md border border-border hover:bg-accent transition-colors"
						>
							<Plus className="w-4 h-4" />
						</button>
					</div>
					{currentGlasses >= WATER_GOAL ? (
						<span className="text-sm font-medium text-green-600 flex items-center gap-1">
							<Check className="w-4 h-4" /> Goal hit!
						</span>
					) : (
						<span className="text-sm text-muted-foreground">
							{WATER_GOAL - currentGlasses} more to go
						</span>
					)}
				</div>

				{/* Water reminder schedule */}
				<details className="mt-3">
					<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
						<Clock className="w-3 h-3" /> Reminder schedule
					</summary>
					<div className="mt-2 grid grid-cols-2 gap-1">
						{WATER_REMINDERS.map((r, i) => (
							<p key={i} className={`text-xs px-2 py-1 rounded ${i < currentGlasses ? "text-green-600 line-through" : "text-muted-foreground"}`}>
								{r}
							</p>
						))}
					</div>
				</details>
			</div>

			{/* Daily Check-In */}
			<div className="bg-card border border-border rounded-lg p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<Activity className="w-5 h-5 text-green-500" />
						<h2 className="font-semibold">Daily Check-In</h2>
					</div>
					{todayCheckIn ? (
						<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
							Done today
						</span>
					) : (
						<button
							onClick={() => setShowCheckIn(!showCheckIn)}
							className="text-sm text-primary font-medium hover:underline"
						>
							{showCheckIn ? "Cancel" : "Check In"}
						</button>
					)}
				</div>

				{todayCheckIn && !showCheckIn && (
					<div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
						<div className="bg-muted/50 rounded-md p-2">
							<Scale className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.weight ?? "—"}</p>
							<p className="text-muted-foreground">lbs</p>
						</div>
						<div className="bg-muted/50 rounded-md p-2">
							<BedDouble className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.sleep_hours ?? "—"}</p>
							<p className="text-muted-foreground">hrs sleep</p>
						</div>
						<div className="bg-muted/50 rounded-md p-2">
							<AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.soreness ?? "—"}/5</p>
							<p className="text-muted-foreground">soreness</p>
						</div>
						<div className="bg-muted/50 rounded-md p-2">
							<Dumbbell className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.worked_out ? "Yes" : "No"}</p>
							<p className="text-muted-foreground">trained</p>
						</div>
						<div className="bg-muted/50 rounded-md p-2">
							<Droplets className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.hit_water_goal ? "Yes" : "No"}</p>
							<p className="text-muted-foreground">water goal</p>
						</div>
						<div className="bg-muted/50 rounded-md p-2">
							<Wine className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
							<p className="font-medium">{todayCheckIn.alcohol ? "Yes" : "No"}</p>
							<p className="text-muted-foreground">alcohol</p>
						</div>
					</div>
				)}

				{showCheckIn && (
					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-xs font-medium text-muted-foreground">Weight (lbs)</label>
								<input
									type="number"
									step="0.1"
									value={checkWeight}
									onChange={(e) => setCheckWeight(e.target.value)}
									placeholder="203"
									className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
								/>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground">Sleep (hours)</label>
								<input
									type="number"
									step="0.5"
									value={checkSleep}
									onChange={(e) => setCheckSleep(e.target.value)}
									placeholder="7.5"
									className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
								/>
							</div>
						</div>

						<div>
							<label className="text-xs font-medium text-muted-foreground">Soreness (1-5)</label>
							<div className="flex gap-1 mt-1">
								{([1, 2, 3, 4, 5] as const).map((n) => (
									<button
										key={n}
										onClick={() => setCheckSoreness(n)}
										className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
											checkSoreness === n
												? "bg-primary text-primary-foreground"
												: "bg-background border border-border hover:bg-accent"
										}`}
									>
										{n === 1 ? "Fresh" : n === 2 ? "Mild" : n === 3 ? "Mod" : n === 4 ? "Sore" : "Wrecked"}
									</button>
								))}
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setCheckWorkedOut(!checkWorkedOut)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
									checkWorkedOut
										? "bg-green-100 border-green-300 text-green-700"
										: "border-border hover:bg-accent"
								}`}
							>
								<Dumbbell className="w-3.5 h-3.5 inline mr-1" />
								Worked Out
							</button>
							<button
								onClick={() => setCheckAlcohol(!checkAlcohol)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
									checkAlcohol
										? "bg-amber-100 border-amber-300 text-amber-700"
										: "border-border hover:bg-accent"
								}`}
							>
								<Wine className="w-3.5 h-3.5 inline mr-1" />
								Had a Drink
							</button>
						</div>

						<div>
							<label className="text-xs font-medium text-muted-foreground">Notes</label>
							<input
								type="text"
								value={checkNotes}
								onChange={(e) => setCheckNotes(e.target.value)}
								placeholder="How are you feeling?"
								className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
							/>
						</div>

						<button
							onClick={handleCheckIn}
							className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							Save Check-In
						</button>
					</div>
				)}
			</div>

			{/* Weigh-In Tracker */}
			<div className="bg-card border border-border rounded-lg p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<TrendingDown className="w-5 h-5 text-primary" />
						<h2 className="font-semibold">Weight Log</h2>
					</div>
					<button
						onClick={() => setShowWeighIn(!showWeighIn)}
						className="text-sm text-primary font-medium hover:underline"
					>
						{showWeighIn ? "Cancel" : "+ Log Weight"}
					</button>
				</div>

				{showWeighIn && (
					<div className="flex gap-2 mb-3">
						<input
							type="number"
							step="0.1"
							value={newWeight}
							onChange={(e) => setNewWeight(e.target.value)}
							placeholder="Weight in lbs"
							className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
						/>
						<button
							onClick={handleWeighIn}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
						>
							Save
						</button>
					</div>
				)}

				{weighIns.length > 0 ? (
					<div className="space-y-1">
						{weighIns.slice(0, 10).map((w) => (
							<div key={w.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
								<span className="text-muted-foreground">{new Date(w.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
								<span className="font-medium">{w.weight} lbs</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground text-center py-4">
						No weigh-ins yet. Start tracking to see your progress!
					</p>
				)}
			</div>

			{/* Weekly Routine */}
			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="px-4 py-3 border-b border-border">
					<h2 className="font-semibold flex items-center gap-2">
						<Dumbbell className="w-5 h-5 text-primary" />
						Weekly Routine
					</h2>
				</div>
				<div className="divide-y divide-border">
					{routines.map((routine) => (
						<div key={routine.day}>
							<button
								onClick={() => setExpandedDay(expandedDay === routine.day ? null : routine.day)}
								className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent/50 transition-colors ${
									routine.day === dayOfWeek ? "bg-primary/5" : ""
								}`}
							>
								<div className="flex items-center gap-3">
									<span className={`text-xs font-bold uppercase w-8 ${routine.day === dayOfWeek ? "text-primary" : "text-muted-foreground"}`}>
										{DAY_LABELS[routine.day]}
									</span>
									<div>
										<p className="font-medium text-sm">{routine.name}</p>
										<p className="text-xs text-muted-foreground">{routine.focus}</p>
									</div>
								</div>
								{expandedDay === routine.day ? (
									<ChevronUp className="w-4 h-4 text-muted-foreground" />
								) : (
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								)}
							</button>
							{expandedDay === routine.day && routine.exercises.length > 0 && (
								<div className="px-4 pb-3 bg-muted/20">
									<div className="divide-y divide-border/50">
										{routine.exercises.map((ex, i) => (
											<div key={i} className="py-2 flex items-center justify-between">
												<div>
													<p className="text-sm font-medium">{ex.name}</p>
													{ex.notes && (
														<p className="text-xs text-muted-foreground italic">{ex.notes}</p>
													)}
												</div>
												<div className="text-right text-xs text-muted-foreground">
													<p>{ex.sets} × {ex.reps}</p>
													<p>Rest: {ex.rest}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Nutrition Tip Carousel */}
			<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
				<p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">Nutrition Tip</p>
				<p className="text-sm text-amber-900">{NUTRITION_TIPS[tipIndex]}</p>
				<div className="flex gap-1 mt-2">
					{NUTRITION_TIPS.map((_, i) => (
						<div
							key={i}
							className={`h-1 rounded-full flex-1 transition-colors ${
								i === tipIndex ? "bg-amber-400" : "bg-amber-200"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Recent Workout History */}
			{workoutLogs.length > 0 && (
				<div className="bg-card border border-border rounded-lg p-4">
					<h2 className="font-semibold mb-3">Recent Workouts</h2>
					<div className="space-y-2">
						{workoutLogs.slice(0, 7).map((log) => (
							<div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
								<div>
									<p className="font-medium">{log.routine_day}</p>
									<p className="text-xs text-muted-foreground">
										{new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
										{" · "}{log.duration_minutes} min
										{" · Energy: "}{log.energy_level}/5
									</p>
								</div>
								<div className="text-xs text-muted-foreground">
									{log.exercises_completed.length} exercises
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
