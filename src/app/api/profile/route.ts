import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { profileSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
            include: { profile: true }
        })

        if (!user) {
            return new NextResponse('User not found in database', { status: 404 })
        }

        return NextResponse.json(user.profile)
    } catch (error) {
        console.error('[PROFILE_GET]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { name, bio, city, level, publicProfile, allowInvites, favoriteSports } = profileSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { clerkId }
        })

        if (!user) {
            return new NextResponse('User not found', { status: 404 })
        }

        const profile = await prisma.profile.update({
            where: { userId: user.id },
            data: {
                name,
                bio,
                city,
                level,
                publicProfile,
                allowInvites,
                favoriteSports
            }
        })

        return NextResponse.json(profile)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }
        console.error('[PROFILE_PUT]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
