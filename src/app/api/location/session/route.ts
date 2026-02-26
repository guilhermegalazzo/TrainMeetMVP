import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const sessionSchema = z.object({
    eventId: z.string().cuid(),
    enabled: z.boolean()
})

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) return new NextResponse('User not found', { status: 404 })

        const body = await req.json()
        const { eventId, enabled } = sessionSchema.parse(body)

        const event = await prisma.event.findUnique({ where: { id: eventId } })
        if (!event) return new NextResponse('Event not found', { status: 404 })

        // Check if participant is going
        const participant = await prisma.eventParticipant.findUnique({
            where: { eventId_userId: { eventId, userId: user.id } }
        })

        if (!participant || participant.status !== 'GOING') {
            return new NextResponse('Must be participating to share location', { status: 403 })
        }

        if (enabled) {
            const session = await prisma.locationShareSession.upsert({
                where: { eventId_userId: { eventId, userId: user.id } },
                update: { enabled: true, endedAt: null },
                create: {
                    eventId,
                    userId: user.id,
                    enabled: true,
                    startedAt: new Date()
                }
            })
            return NextResponse.json(session)
        } else {
            const session = await prisma.locationShareSession.update({
                where: { eventId_userId: { eventId, userId: user.id } },
                data: { enabled: false, endedAt: new Date() }
            })
            return NextResponse.json(session)
        }
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[LOCATION_SESSION_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
