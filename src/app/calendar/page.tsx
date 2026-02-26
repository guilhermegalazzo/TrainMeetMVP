import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default async function CalendarPage() {
    const { userId: clerkId } = await auth()
    if (!clerkId) redirect('/sign-in')

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) redirect('/')

    const userEvents = await prisma.event.findMany({
        where: {
            OR: [
                { hostId: user.id },
                { participants: { some: { userId: user.id } } },
            ],
            startsAt: { gte: new Date() } // currently only showing upcoming
        },
        include: {
            sport: true,
            host: { include: { profile: true } }
        },
        orderBy: { startsAt: 'asc' }
    })

    // Group by date
    const groupedEvents: Record<string, any[]> = {}
    userEvents.forEach(event => {
        const dateStr = format(new Date(event.startsAt), 'yyyy-MM-dd')
        if (!groupedEvents[dateStr]) groupedEvents[dateStr] = []
        groupedEvents[dateStr].push(event)
    })

    const sortedDates = Object.keys(groupedEvents).sort()

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Training Calendar</h1>
            <p className="text-slate-500">Stay on top of your upcoming group workouts and personal sessions.</p>

            {sortedDates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">Your schedule is empty</h3>
                    <p className="text-slate-500 mt-2 hover:underline">Find a public <Link href="/explore" className="text-blue-600 font-semibold">event</Link> or create a new one.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sortedDates.map(dateStr => (
                        <div key={dateStr} className="relative">
                            <h2 className="text-xl font-bold text-slate-700 mb-4 sticky top-16 bg-neutral-50/90 py-2 backdrop-blur z-10">
                                {format(new Date(dateStr), 'EEEE, MMMM do, yyyy')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {groupedEvents[dateStr].map(event => (
                                    <Link href={`/events/${event.id}`} key={event.id}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full border-slate-200">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">{event.sport.name}</Badge>
                                                    <span className="text-sm font-semibold flex items-center text-slate-500">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {format(new Date(event.startsAt), 'h:mm a')}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="mt-auto pb-4">
                                                {event.address && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <MapPin className="w-4 h-4 shrink-0" />
                                                        <span className="truncate">{event.address}</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
