import { supabase } from './supabaseClient';

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  due_date: string;
  completed: boolean;
  user_id: string;
  dueDate?: string; // For compatibility with existing code
}

// Get goals for a user
export async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    // Map snake_case back to camelCase for frontend compatibility
    return (data || []).map(goal => ({
      ...goal,
      dueDate: goal.due_date // Add compatibility field
    }));
  } catch (error) {
    console.error('Exception fetching goals:', error);
    return [];
  }
}

// Create a new goal
export async function createGoal(goal: Omit<Goal, 'id'>): Promise<Goal | null> {
  // Map camelCase to snake_case for database compatibility
  const dbGoal = {
    user_id: goal.user_id,
    title: goal.title,
    target: goal.target,
    current: goal.current,
    due_date: goal.dueDate || goal.due_date, // Handle both formats
    completed: goal.completed
  };
  
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([dbGoal])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }

    // Map snake_case back to camelCase for frontend compatibility
    if (data) {
      return {
        ...data,
        dueDate: data.due_date // Add compatibility field
      };
    }
    return null;
  } catch (error) {
    console.error('Exception creating goal:', error);
    return null;
  }
}

// Update an existing goal
export async function updateGoal(goal: Goal): Promise<Goal | null> {
  // Map camelCase to snake_case for database compatibility
  const dbGoal = {
    title: goal.title,
    target: goal.target,
    current: goal.current,
    due_date: goal.dueDate || goal.due_date, // Handle both formats
    completed: goal.completed
  };
  
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .update(dbGoal)
      .eq('id', goal.id)
      .eq('user_id', goal.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    // Map snake_case back to camelCase for frontend compatibility
    if (data) {
      return {
        ...data,
        dueDate: data.due_date // Add compatibility field
      };
    }
    return null;
  } catch (error) {
    console.error('Exception updating goal:', error);
    return null;
  }
}

// Delete a goal
export async function deleteGoal(goalId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting goal:', error);
    return false;
  }
}
