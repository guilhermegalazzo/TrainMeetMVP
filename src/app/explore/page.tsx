import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar as CalendarIcon, Clock, Search } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function ExplorePage() {
    const publicEvents = await prisma.event.findMany({
        where: {
            type: 'PUBLIC',
            status: 'ACTIVE',
            startsAt: { gte: new Date() }
        },
        include: {
            sport: true,
            host: { include: { profile: true } },
            _count: { select: { participants: true } }
        },
        orderBy: { startsAt: 'asc' },
        take: 30
    })

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Explore Events</h1>
                    <p className="text-slate-500 mt-2">Discover public training sessions and meet local athletes.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search city or sport..." className="pl-9 bg-white" />
                    </div>
                    <Button variant="outline">Filters</Button>
                </div>
            </div>

            {publicEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No public events found</h3>
                    <p className="text-slate-500">Check back later or organize your own public event!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicEvents.map((event: any) => (
                        <Link href={`/events/${event.id}`} key={event.id}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-slate-200 flex flex-col hover:-translate-y-1">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                            {event.sport.name}
                                        </Badge>
                                        {event.capacity && (
                                            <span className="text-xs font-semibold text-slate-500">
                                                {event._count.participants} / {event.capacity}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-slate-600 pb-4 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{format(new Date(event.startsAt), 'EEE, MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{format(new Date(event.startsAt), 'h:mm a')}</span>
                                    </div>
                                    {event.address && (
                                        <div className="flex flex-start gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2 text-slate-500">{event.address}</span>
                                        </div>
                                    )}
                                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                                        {event.host.profile?.avatarUrl ? (
                                            <img src={event.host.profile.avatarUrl} alt="Host" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-200" />
                                        )}
                                        <span className="text-xs text-slate-500 font-medium truncate">Hosted by {event.host.profile?.name}</span>
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
