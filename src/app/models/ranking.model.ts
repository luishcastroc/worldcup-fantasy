export interface UserRanking {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
    total_points: number;
    exact_predictions: number;
    correct_outcomes: number;
    exact_with_goals: number;
    total_predictions: number;
    rank: number;
}

export interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    status: 'pending' | 'approved' | 'suspended';
    role: 'user' | 'admin';
    invite_quota: number;
    created_at?: string;
    updated_at?: string;
}
