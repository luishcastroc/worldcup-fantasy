export interface InviteCode {
    id: string;
    code: string;
    created_by: string;
    used_by: string | null;
    used_at: string | null;
    expires_at: string | null;
    created_at: string;
}
