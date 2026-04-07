import { createClient } from '@supabase/supabase-js';
import { UserStats } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../constants';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw authError;
    }

    if (!authData.user?.id) {
      throw new Error('No user ID returned from signup');
    }

    console.log('User created in auth:', authData.user.id);

    // Create user record in users table
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name,
        avatar: getRandomAvatar()
      }]);

    if (userError) {
      console.error('User insert error:', userError);
      throw userError;
    }

    console.log('User record created in database');

    // Create initial stats
    const subProgress: Record<string, number> = {};
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert([{
        user_id: authData.user.id,
        points: 0,
        hearts: 5,
        level: 1,
        current_streak: 1,
        last_activity_date: new Date().toDateString(),
        solved_count: 0,
        solved_today: 0,
        correct_answers: 0,
        mistakes_count: 0,
        subject_progress: subProgress,
        weak_topics: {},
        achievements: INITIAL_ACHIEVEMENTS
      }]);

    if (statsError) {
      console.error('Stats insert error:', statsError);
      throw statsError;
    }

    console.log('Stats created');

    // Try to sign in immediately to create session
    // This helps if email confirmation is required but user was created
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInResult.data?.session) {
        console.log('Session created after signup');
      }
    } catch (signInError) {
      console.log('Sign in after signup failed (may require email confirmation):', signInError);
      // Still continue - user was created, just no session yet
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful for user:', data.user?.id);
    return { success: true, userId: data.user?.id };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

// User Stats Functions
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    // Get user from database directly - no session required
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
      return null;
    }

    // Get user stats from database
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Stats fetch error:', statsError);
      return null;
    }

    // If user exists, return their stats
    if (userData) {
      return {
        email: userData.email,
        name: userData.name,
        points: statsData?.points || 0,
        hearts: statsData?.hearts || 5,
        level: statsData?.level || 1,
        currentStreak: statsData?.current_streak || 0,
        solvedCount: statsData?.solved_count || 0,
        solvedToday: statsData?.solved_today || 0,
        correctAnswers: statsData?.correct_answers || 0,
        mistakesCount: statsData?.mistakes_count || 0,
        subjectProgress: statsData?.subject_progress || {},
        weakTopics: statsData?.weak_topics || {},
        achievements: statsData?.achievements || INITIAL_ACHIEVEMENTS,
        avatar: userData.avatar || '😊'
      };
    }

    return null;
  } catch (error) {
    console.error('Get user stats error:', error);
    return null;
  }
};

export const updateUserStats = async (userId: string, updates: Partial<UserStats>) => {
  try {
    const { error: statsError } = await supabase
      .from('user_stats')
      .update({
        points: updates.points,
        hearts: updates.hearts,
        level: updates.level,
        current_streak: updates.currentStreak,
        last_activity_date: updates.lastActivityDate,
        solved_count: updates.solvedCount,
        solved_today: updates.solvedToday,
        correct_answers: updates.correctAnswers,
        mistakes_count: updates.mistakesCount,
        subject_progress: updates.subjectProgress,
        weak_topics: updates.weakTopics,
        achievements: updates.achievements,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (statsError) throw statsError;
    return { success: true };
  } catch (error) {
    console.error('Update user stats error:', error);
    throw error;
  }
};

export const saveLessonHistory = async (userId: string, subject: string, difficulty: string, correct: number, total: number, points: number) => {
  try {
    const { error } = await supabase
      .from('lesson_history')
      .insert([{
        user_id: userId,
        subject,
        difficulty,
        correct,
        total,
        earned_points: points
      }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Save lesson history error:', error);
    throw error;
  }
};

// Helper functions
const getRandomAvatar = (): string => {
  const avatars = ['🦊', '🐱', '🐼', '🐨', '🦁', '🦉'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

const mapToUserStats = (userData: any, statsData: any): UserStats => {
  return {
    email: userData.email,
    name: userData.name,
    points: statsData?.points || 0,
    hearts: statsData?.hearts || 5,
    level: statsData?.level || 1,
    currentStreak: statsData?.current_streak || 0,
    lastActivityDate: statsData?.last_activity_date,
    solvedCount: statsData?.solved_count || 0,
    solvedToday: statsData?.solved_today || 0,
    correctAnswers: statsData?.correct_answers || 0,
    mistakesCount: statsData?.mistakes_count || 0,
    subjectProgress: statsData?.subject_progress || {},
    weakTopics: statsData?.weak_topics || {},
    achievements: statsData?.achievements || [],
    avatar: userData.avatar || getRandomAvatar()
  };
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};
