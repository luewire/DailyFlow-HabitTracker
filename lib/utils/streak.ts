export interface DayCompletion {
    day: string;
    total: number;
    goal: number;
}

export function calculateStreak(days: DayCompletion[]): number {
    if (!days || days.length === 0) return 0;

    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysOfWeek[today.getDay()];

    // Create a mapping for quick lookup
    const dayMap = new Map<string, DayCompletion>();
    days.forEach(d => dayMap.set(d.day, d));

    // Determine the sequence of days to check backwards from today
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentIndex = order.indexOf(currentDayName);

    if (currentIndex === -1) return 0; // Should not happen

    let streak = 0;

    // Check from today backwards
    for (let i = currentIndex; i >= 0; i--) {
        const dayName = order[i];
        const dayData = dayMap.get(dayName);

        if (dayData && dayData.total >= dayData.goal) {
            streak++;
        } else {
            // If it's today and not completed yet, we look at yesterday
            if (i === currentIndex) {
                continue;
            }
            break;
        }
    }

    return streak;
}
