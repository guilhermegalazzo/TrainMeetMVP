import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { locationPingSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) return new NextResponse('User not found', { status: 404 })

        const body = await req.json()
        const { sessionId, latitude, longitude, accuracy } = locationPingSchema.parse(body)

        // Verify session belongs to user and is active
        const session = await prisma.locationShareSession.findUnique({
            where: { id: sessionId },
            include: { event: true }
        })

        if (!session || session.userId !== user.id || !session.enabled || session.endedAt) {
            return new NextResponse('Invalid or inactive session', { status: 403 })
        }

        // Verify it is within the 20-minute window before the event, or during the event
        const now = new Date()
        const windowStart = new Date(session.event.startsAt.getTime() - 20 * 60000)

        // Allow pings up to the end time
        if (now < windowStart || now > session.event.endsAt) {
            return new NextResponse('Outside allowed sharing window', { status: 403 })
        }

        const ping = await prisma.locationPing.create({
            data: {
                sessionId,
                latitude,
                longitude,
                accuracy,
                timestamp: new Date()
            }
        })

        return NextResponse.json(ping)
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[LOCATION_PING_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
