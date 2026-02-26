import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import PresenceButtons from './_components/presence-buttons'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { userId: clerkId } = await auth()

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            sport: true,
            host: { include: { profile: true } },
            participants: {
                include: { user: { include: { profile: true } } }
            }
        }
    })

    if (!event) return redirect('/explore')

    let currentUser: any = null
    let currentParticipant: any = null
    let hasPendingInvite: boolean = false

    if (clerkId) {
        currentUser = await prisma.user.findUnique({ where: { clerkId } })
        if (currentUser) {
            currentParticipant = event.participants.find(p => p.userId === currentUser.id)

            const invite = await prisma.invitation.findUnique({
                where: { eventId_receiverId: { eventId: id, receiverId: currentUser.id } }
            })
            hasPendingInvite = invite?.status === 'PENDING'
        }
    }

    // Privacy Check for Map
    const canViewMap =
        event.type === 'PUBLIC' ||
        (currentUser && event.hostId === currentUser.id) ||
        (currentParticipant && currentParticipant.status === 'GOING')

    const confirmedParticipants = event.participants.filter(p => p.status === 'GOING')

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">

            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
                    <div className="flex gap-2 mb-4">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">{event.sport.name}</Badge>
                        <Badge variant="outline" className="text-slate-500">{event.type}</Badge>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {event.title}
                    </h1>

                    <div className="flex items-center gap-3 mt-6 pb-6 border-b border-slate-100">
                        {event.host.profile?.avatarUrl ? (
                            <img src={event.host.profile.avatarUrl} alt="Host" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                        )}
                        <div>
                            <p className="text-sm text-slate-500">Hosted by</p>
                            <p className="text-base font-medium text-slate-800">{event.host.profile?.name}</p>
                        </div>
                    </div>

                    <div className="py-6 space-y-4 border-b border-slate-100">
                        <div className="flex items-center gap-3 text-slate-700">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <span className="font-medium">{format(new Date(event.startsAt), 'EEEE, MMMM do, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <span className="font-medium">
                                {format(new Date(event.startsAt), 'h:mm a')} – {format(new Date(event.endsAt), 'h:mm a')}
                            </span>
                        </div>
                        {event.address && (
                            <div className="flex items-start gap-3 text-slate-700">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                <span className="font-medium leading-relaxed">{event.address}</span>
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <div className="pt-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">About this event</h3>
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                        </div>
                    )}
                </div>

                {/* The Interactive Map */}
                {canViewMap && (event.latitude && event.longitude || event.address) && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[400px]">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Location Map</h3>
                        <div className="w-full h-[300px] rounded-xl overflow-hidden relative bg-slate-100">
                            <EventMap
                                eventId={event.id}
                                initLat={event.latitude || 0}
                                initLng={event.longitude || 0}
                                startsAt={event.startsAt}
                                locationVisibility={event.locationVisibility}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column - Actions & Roster */}
            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Your Status</h3>

                    {!currentUser ? (
                        <Button className="w-full bg-blue-600">Sign in to Join</Button>
                    ) : (
                        <PresenceButtons
                            eventId={event.id}
                            status={currentParticipant?.status || (hasPendingInvite ? 'INVITED' : 'NONE')}
                            isHost={event.hostId === currentUser.id}
                        />
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Attendees
                            </h3>
                            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {confirmedParticipants.length} {event.capacity ? `/ ${event.capacity}` : ''}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {confirmedParticipants.map(p => (
                                <div key={p.id} className="flex items-center gap-3">
                                    {p.user.profile?.avatarUrl ? (
                                        <img src={p.user.profile.avatarUrl} alt={p.user.profile.name} className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-200" />
                                    )}
                                    <span className="text-sm font-medium text-slate-700">{p.user.profile?.name}</span>
                                    {p.role === 'HOST' && <Badge variant="secondary" className="ml-auto text-xs bg-amber-100 text-amber-800">Host</Badge>}
                                </div>
                            ))}
                            {confirmedParticipants.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No one has confirmed yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
