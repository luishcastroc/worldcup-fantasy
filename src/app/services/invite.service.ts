import { inject, Injectable, resource, ResourceRef } from '@angular/core';
import { InviteCode } from '../models';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root',
})
export class InviteService {
    private supabase = inject(SupabaseService);

    /** Invite codes created by the current user (for profile page). */
    myCodesResource: ResourceRef<InviteCode[]> = resource({
        params: () => ({ userId: this.supabase.currentUser()?.id }),
        loader: async ({ params }) => {
            if (!params.userId) return [];

            const { data, error } = await this.supabase.client
                .from('invite_codes')
                .select('*')
                .eq('created_by', params.userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading invite codes:', error);
                return [];
            }

            return (data ?? []) as InviteCode[];
        },
        defaultValue: [],
    });

    /** All invite codes — admin use only. */
    allCodesResource: ResourceRef<InviteCode[]> = resource({
        loader: async () => {
            const { data, error } = await this.supabase.client
                .from('invite_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading all invite codes:', error);
                return [];
            }

            return (data ?? []) as InviteCode[];
        },
        defaultValue: [],
    });

    /**
     * Validates an invite code WITHOUT consuming it.
     * Can be called before authentication (uses anon key).
     * Returns 'valid', 'invalid', or 'expired'.
     */
    async validateCode(code: string): Promise<'valid' | 'invalid' | 'expired'> {
        const { data, error } = await this.supabase.client.rpc('validate_invite_code', {
            p_code: code.trim().toUpperCase(),
        });

        if (error) {
            console.error('Error validating invite code:', error);
            return 'invalid';
        }

        return data as 'valid' | 'invalid' | 'expired';
    }

    /**
     * Redeems an invite code for the currently authenticated user.
     * Returns 'ok', 'invalid', 'expired', or 'already_approved'.
     */
    async redeemCode(code: string): Promise<'ok' | 'invalid' | 'expired' | 'already_approved'> {
        const { data, error } = await this.supabase.client.rpc('redeem_invite_code', {
            p_code: code.trim().toUpperCase(),
        });

        if (error) {
            console.error('Error redeeming invite code:', error);
            return 'invalid';
        }

        return data as 'ok' | 'invalid' | 'expired' | 'already_approved';
    }

    /**
     * Generates a new invite code for the current user.
     * Throws if the user's quota is exceeded or they are not approved.
     */
    async generateCode(): Promise<string> {
        const { data, error } = await this.supabase.client.rpc('generate_invite_code');

        if (error) {
            console.error('Error generating invite code:', error);
            throw new Error(error.message);
        }

        return data as string;
    }
}
