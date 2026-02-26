import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CreateEventForm from './_components/create-event-form'

export default async function CreateEventPage() {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
        redirect('/sign-in')
    }

    // Pre-fetch sports to populate the dropdown
    const sports = await prisma.sport.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create an Event</h1>
                <p className="text-slate-500 mt-2">Organize your next training session and invite others to join.</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <CreateEventForm sports={sports} />
            </div>
        </div>
    )
}
