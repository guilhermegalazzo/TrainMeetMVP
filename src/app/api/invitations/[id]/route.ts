import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const respondSchema = z.object({
    status: z.enum(['ACCEPTED', 'DECLINED']),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth()
        const { id: inviteId } = await params

        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) return new NextResponse('User not found', { status: 404 })

        const invite = await prisma.invitation.findUnique({
            where: { id: inviteId },
            include: { event: true }
        })

        if (!invite || invite.receiverId !== user.id) {
            return new NextResponse('Invitation not found or unauthorized', { status: 404 })
        }

        const body = await req.json()
        const { status } = respondSchema.parse(body)

        const updatedInvite = await prisma.invitation.update({
            where: { id: inviteId },
            data: { status }
        })

        // If accepted, add to participants
        if (status === 'ACCEPTED') {
            await prisma.eventParticipant.upsert({
                where: { eventId_userId: { eventId: invite.eventId, userId: user.id } },
                update: { status: 'GOING' },
                create: {
                    eventId: invite.eventId,
                    userId: user.id,
                    status: 'GOING',
                    role: 'MEMBER'
                }
            })

            // Notify sender
            await prisma.notification.create({
                data: {
                    userId: invite.senderId,
                    type: 'INVITE_ACCEPTED',
                    title: 'Invitation Accepted',
                    body: `An athlete accepted your invite for ${invite.event.title}`,
                    linkUrl: `/events/${invite.eventId}`
                }
            })
        }

        return NextResponse.json(updatedInvite)
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[INVITATION_PUT]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
