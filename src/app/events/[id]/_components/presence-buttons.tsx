"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function PresenceButtons({ eventId, status, isHost }: { eventId: string, status: string, isHost: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (newStatus: string) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/events/${eventId}/presence`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error()
            toast.success('Status updated')
            router.refresh()
        } catch (e) {
            toast.error('Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    if (isHost) {
        return (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-center font-medium">
                You are organizing this event!
            </div>
        )
    }

    if (status === 'GOING') {
        return (
            <div className="space-y-3">
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-center font-semibold">
                    ✓ You are going!
                </div>
                <Button
                    variant="outline"
                    className="w-full text-slate-500 hover:text-red-600"
                    onClick={() => handleUpdate('CANCELLED')}
                    disabled={loading}
                >
                    Cancel Attendance
                </Button>
            </div>
        )
    }

    if (status === 'INVITED') {
        return (
            <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleUpdate('DECLINED')} disabled={loading}>Decline</Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={() => handleUpdate('GOING')} disabled={loading}>Accept Invite</Button>
            </div>
        )
    }

    return (
        <Button
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
            onClick={() => handleUpdate('GOING')}
            disabled={loading}
        >
            Join Event
        </Button>
    )
}
