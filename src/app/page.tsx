import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'

export default async function Home() {
  const { userId: clerkId } = await auth()

  let user: any = null
  let upcomingEvents: any[] = []
  let pendingInvites: any[] = []

  if (clerkId) {
    user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true }
    })

    if (user) {
      upcomingEvents = await prisma.event.findMany({
        where: {
          OR: [
            { hostId: user.id },
            { participants: { some: { userId: user.id } } }
          ],
          startsAt: { gte: new Date() }
        },
        include: { sport: true, host: { include: { profile: true } } },
        orderBy: { startsAt: 'asc' },
        take: 3
      })

      pendingInvites = await prisma.invitation.findMany({
        where: {
          receiverId: user.id,
          status: 'PENDING'
        },
        include: {
          event: { include: { sport: true } },
          sender: { include: { profile: true } }
        }
      })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {user ? `Welcome back, ${user.profile?.name?.split(' ')[0]}!` : 'Find Your Next Training Partner'}
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl">
            Join local group runs, organize rides with friends, and safely share your location when training together.
          </p>
          <div className="flex gap-4">
            <Link href="/explore">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-neutral-100 font-semibold shadow-lg">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {user && pendingInvites.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Pending Invitations
            <Badge variant="destructive" className="ml-2">{pendingInvites.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingInvites.map((invite: any) => (
              <Card key={invite.id} className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-lg">{invite.event.title}</CardTitle>
                  <CardDescription>Invited by {invite.sender.profile?.name}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="text-slate-600 border-slate-300">Decline</Button>
                  <Button className="bg-amber-500 hover:bg-amber-600">Accept</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {user && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Your Upcoming Events</h2>
            <Link href="/calendar" className="text-blue-600 font-medium hover:underline">View all</Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No upcoming events</h3>
              <p className="text-slate-500 mb-4">You have not joined or organized any upcoming events.</p>
              <Link href="/events/create">
                <Button>Create an Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Link href={`/events/${event.id}`} key={event.id}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {event.sport.name}
                        </Badge>
                        <Badge variant="outline" className="text-slate-500">{event.type}</Badge>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600 pb-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span>{format(new Date(event.startsAt), 'EEE, MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{format(new Date(event.startsAt), 'h:mm a')}</span>
                      </div>
                      {event.address && (
                        <div className="flex flex-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{event.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
