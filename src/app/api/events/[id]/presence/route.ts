import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { presenceSchema } from '@/lib/validations'
import { z } from 'zod'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth()
        const { id: eventId } = await params

        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) return new NextResponse('User not found', { status: 404 })

        const body = await req.json()
        const { status } = presenceSchema.parse(body)

        const participant = await prisma.eventParticipant.upsert({
            where: {
                eventId_userId: { eventId, userId: user.id }
            },
            update: { status },
            create: {
                eventId,
                userId: user.id,
                status,
                role: 'MEMBER'
            }
        })

        // If there was a pending invitation, mark it as accepted/declined
        if (status === 'GOING' || status === 'DECLINED') {
            const inviteStatus = status === 'GOING' ? 'ACCEPTED' : 'DECLINED'
            await prisma.invitation.updateMany({
                where: { eventId, receiverId: user.id, status: 'PENDING' },
                data: { status: inviteStatus }
            })
        }

        return NextResponse.json(participant)
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[PRESENCE_PUT]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
