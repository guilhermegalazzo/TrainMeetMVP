import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, BellDot, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function NotificationsPage() {
    const { userId: clerkId } = await auth()
    if (!clerkId) redirect('/sign-in')

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) redirect('/')

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    // Optionally mark all as read automatically, or add an API route. 
    // For MVP, mark as read on visit:
    if (notifications.some(n => !n.read)) {
        await prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true }
        })
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Notifications</h1>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
                    <p className="text-slate-500 mt-2">No new notifications here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notif => (
                        <Link key={notif.id} href={notif.linkUrl || '#'} className="block">
                            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                                <CardContent className="p-4 flex gap-4 items-start">
                                    {!notif.read ? (
                                        <BellDot className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                                    ) : (
                                        <Bell className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                                        <p className={`text-sm mt-1 ${notif.read ? 'text-slate-500' : 'text-slate-700'}`}>{notif.body}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
