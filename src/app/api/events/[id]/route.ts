import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { eventSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                sport: true,
                host: { include: { profile: true } },
                participants: { include: { user: { include: { profile: true } } } },
            }
        })

        if (!event) return new NextResponse('Not found', { status: 404 })

        return NextResponse.json(event)
    } catch (error) {
        console.error('[EVENT_ID_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth()
        const { id } = await params
        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) return new NextResponse('User not found', { status: 404 })

        const event = await prisma.event.findUnique({ where: { id } })
        if (!event || event.hostId !== user.id) {
            return new NextResponse('Unauthorized or not found', { status: 401 })
        }

        const body = await req.json()
        const validatedData = eventSchema.parse(body)

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: validatedData
        })

        return NextResponse.json(updatedEvent)
    } catch (error) {
        if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        console.error('[EVENT_ID_PUT]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth()
        const { id } = await params
        if (!clerkId) return new NextResponse('Unauthorized', { status: 401 })

        const user = await prisma.user.findUnique({ where: { clerkId } })
        const event = await prisma.event.findUnique({ where: { id } })

        if (!user || !event || event.hostId !== user.id) {
            return new NextResponse('Unauthorized or not found', { status: 401 })
        }

        await prisma.event.delete({ where: { id } })
        return new NextResponse('Event deleted', { status: 200 })
    } catch (error) {
        console.error('[EVENT_ID_DELETE]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
