import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileForm from './_components/profile-form'

export default async function ProfilePage() {
    const { userId: clerkId } = await auth()
    if (!clerkId) redirect('/sign-in')

    const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { profile: true }
    })

    if (!user || !user.profile) redirect('/')

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile & Settings</h1>
                <p className="text-slate-500 mt-2">Manage your public information and privacy preferences.</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <ProfileForm initialData={user.profile} />
            </div>
        </div>
    )
}
