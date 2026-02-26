import { z } from 'zod'

export const profileSchema = z.object({
    name: z.string().min(2).max(50),
    bio: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    publicProfile: z.boolean().optional(),
    allowInvites: z.boolean().optional(),
    favoriteSports: z.array(z.string()).optional(),
})

export const eventSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    sportId: z.string().min(1),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    durationMinutes: z.number().int().positive().optional(),
    address: z.string().max(255).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    capacity: z.number().int().positive().optional(),
    type: z.enum(['PUBLIC', 'PRIVATE', 'GROUP']).default('PUBLIC'),
    requireApproval: z.boolean().default(false),
    guestsCanInvite: z.boolean().default(true),
    locationVisibility: z.enum(['CONFIRMED_ONLY', 'ALL', 'NONE']).default('CONFIRMED_ONLY'),
})

export const inviteSchema = z.object({
    receiverId: z.string().cuid(),
})

export const presenceSchema = z.object({
    status: z.enum(['GOING', 'DECLINED', 'WAITLIST', 'CANCELLED']),
})

export const locationPingSchema = z.object({
    sessionId: z.string().cuid(),
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
})
