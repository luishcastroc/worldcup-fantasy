import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

setupTestBed({ zoneless: false });

const makeMockSupabase = () => ({
    currentUser: signal<null>(null),
    isLoading: signal(false),
    waitForAuth: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    client: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
            }),
        }),
    },
});

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: SupabaseService, useValue: makeMockSupabase() },
            ],
        });
        service = TestBed.inject(AuthService);
    });

    it('creates without error (toObservable must run in injection context)', () => {
        // If profileLoading$ used toObservable() inside an async method instead of a
        // field initializer, instantiation here would throw NG0203.
        expect(service).toBeTruthy();
    });

    it('waitForProfile() resolves without throwing NG0203', async () => {
        // NG0203 is thrown when toObservable() runs outside an injection context.
        // Moving it to a field initializer (which runs during inject()) fixes this.
        await expect(service.waitForProfile()).resolves.toBeNull();
    });

    it('isPending returns false when no profile is loaded', () => {
        expect(service.isPending()).toBe(false);
    });

    it('isApproved returns false when no profile is loaded', () => {
        expect(service.isApproved()).toBe(false);
    });

    it('isAdmin returns false when no profile is loaded', () => {
        expect(service.isAdmin()).toBe(false);
    });
});
