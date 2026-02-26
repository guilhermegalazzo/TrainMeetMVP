import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { inviteSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth()
        const { id: eventId } = await params

        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const sender = await prisma.user.findUnique({ where: { clerkId } })
        if (!sender) return new NextResponse('Sender not found', { status: 404 })

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { participants: true }
        })

        if (!event) return new NextResponse('Event not found', { status: 404 })

        // Check if sender has permission (is host, or guestsCanInvite is true and they are going)
        const isHost = event.hostId === sender.id
        const isGoing = event.participants.some(p => p.userId === sender.id && p.status === 'GOING')

        if (!isHost && (!event.guestsCanInvite || !isGoing)) {
            return new NextResponse('Not allowed to invite', { status: 403 })
        }

        const body = await req.json()
        const { receiverId } = inviteSchema.parse(body)

        // Cannot invite yourself
        if (receiverId === sender.id) {
            return new NextResponse('Cannot invite yourself', { status: 400 })
        }

        // Check if already invited or participating
        const existingInvite = await prisma.invitation.findUnique({
            where: { eventId_receiverId: { eventId, receiverId } }
        })

        if (existingInvite) {
            return new NextResponse('User already invited', { status: 400 })
        }

        const existingParticipant = await prisma.eventParticipant.findUnique({
            where: { eventId_userId: { eventId, userId: receiverId } }
        })

        if (existingParticipant && existingParticipant.status !== 'CANCELLED') {
            return new NextResponse('User already participating', { status: 400 })
        }

        const invite = await prisma.invitation.create({
            data: {
                eventId,
                senderId: sender.id,
                receiverId
            }
        })

        // create notification for receiver
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: 'INVITE_RECEIVED',
                title: 'New Invitation',
                body: `You have been invited to ${event.title}`,
                linkUrl: `/events/${event.id}`
            }
        })

        return NextResponse.json(invite)
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[EVENT_INVITE_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
