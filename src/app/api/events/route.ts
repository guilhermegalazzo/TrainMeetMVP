import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { eventSchema } from '@/lib/validations'
import { z } from 'zod'

// GET all public events OR events the user is invited to/hosting
export async function GET(req: Request) {
    try {
        const { userId: clerkId } = await auth()
        const { searchParams } = new URL(req.url)
        const view = searchParams.get('view') || 'explore' // explore or my_events

        let userBaseId: string | null = null
        if (clerkId) {
            const u = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
            userBaseId = u?.id || null
        }

        if (view === 'my_events' && userBaseId) {
            const events = await prisma.event.findMany({
                where: {
                    OR: [
                        { hostId: userBaseId },
                        { participants: { some: { userId: userBaseId } } },
                        { invitations: { some: { receiverId: userBaseId } } }
                    ]
                },
                include: {
                    sport: true,
                    host: { include: { profile: true } }
                },
                orderBy: { startsAt: 'asc' }
            })
            return NextResponse.json(events)
        }

        // Default explore view: PUBLIC events
        const events = await prisma.event.findMany({
            where: {
                type: 'PUBLIC',
                status: 'ACTIVE',
                startsAt: { gte: new Date() } // Future events
            },
            include: {
                sport: true,
                host: { include: { profile: true } }
            },
            orderBy: { startsAt: 'asc' },
            take: 50
        })

        return NextResponse.json(events)

    } catch (error) {
        console.error('[EVENTS_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// CREATE event
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const validatedData = eventSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { clerkId }
        })

        if (!user) {
            return new NextResponse('User not found', { status: 404 })
        }

        // Verify sport exists
        const sportExists = await prisma.sport.findUnique({
            where: { id: validatedData.sportId }
        })

        if (!sportExists) {
            return new NextResponse('Sport not found', { status: 404 })
        }

        const event = await prisma.event.create({
            data: {
                ...validatedData,
                hostId: user.id,
                // Automatically add host as a participant
                participants: {
                    create: {
                        userId: user.id,
                        role: 'HOST',
                        status: 'GOING'
                    }
                }
            },
            include: {
                sport: true,
                participants: true
            }
        })

        return NextResponse.json(event)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }
        console.error('[EVENTS_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
