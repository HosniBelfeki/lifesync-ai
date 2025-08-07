import { useMemo } from 'react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface HealthLog {
  id: string;
  type: 'weight' | 'exercise' | 'sleep' | 'water' | 'steps';
  value: number;
  unit: string;
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface MoodLog {
  id: string;
  score: number;
  notes?: string;
  date: string;
}

export function useMockData() {
  const mockTasks: Task[] = useMemo(() => [
    {
      id: '1',
      title: 'Morning workout',
      description: '30 minutes cardio + strength training',
      completed: true,
      priority: 'high',
      dueDate: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Review monthly budget',
      description: 'Check expenses and update savings goals',
      completed: false,
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: '3',
      title: 'Meal prep for the week',
      description: 'Prepare healthy meals for Mon-Wed',
      completed: false,
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Call dentist for appointment',
      completed: false,
      priority: 'low',
    },
  ], []);

  const mockHealthLogs: HealthLog[] = useMemo(() => {
    const logs: HealthLog[] = [];
    const today = new Date();
    
    // Generate weight data for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        id: `weight-${i}`,
        type: 'weight',
        value: 70 + Math.sin(i * 0.1) * 2 + Math.random() * 1,
        unit: 'kg',
        date: date.toISOString().split('T')[0],
      });
    }

    // Add other health data for recent days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      logs.push(
        {
          id: `sleep-${i}`,
          type: 'sleep',
          value: 7 + Math.random() * 2,
          unit: 'hours',
          date: dateStr,
        },
        {
          id: `steps-${i}`,
          type: 'steps',
          value: 8000 + Math.random() * 4000,
          unit: 'steps',
          date: dateStr,
        },
        {
          id: `water-${i}`,
          type: 'water',
          value: 6 + Math.random() * 4,
          unit: 'glasses',
          date: dateStr,
        }
      );
    }

    return logs;
  }, []);

  const mockExpenses: Expense[] = useMemo(() => {
    const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health & Fitness'];
    const expenses: Expense[] = [];
    const today = new Date();

    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      expenses.push({
        id: `expense-${i}`,
        amount: Math.floor(Math.random() * 200) + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Sample expense ${i + 1}`,
        date: date.toISOString().split('T')[0],
      });
    }

    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const mockMoodLogs: MoodLog[] = useMemo(() => {
    const logs: MoodLog[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      logs.push({
        id: `mood-${i}`,
        score: Math.floor(Math.random() * 5) + 1,
        notes: i % 3 === 0 ? 'Had a great day!' : undefined,
        date: date.toISOString().split('T')[0],
      });
    }

    return logs;
  }, []);

  return {
    mockTasks,
    mockHealthLogs,
    mockExpenses,
    mockMoodLogs,
  };
}