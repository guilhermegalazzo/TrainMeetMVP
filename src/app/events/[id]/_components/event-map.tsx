"use client"

import { MapPin } from 'lucide-react'

// Map rendering has been temporarily simplified to ensure Vercel build stability
// react-map-gl currently has resolution issues with Turbopack in Next.js 15+

export default function EventMap({ eventId, initLat, initLng, startsAt, locationVisibility }: any) {
    return (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-300 rounded-xl">
            <MapPin className="text-slate-400 w-12 h-12 mb-4" />
            <h3 className="font-semibold text-slate-700">Interactive Map View</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-[200px]">
                (Mapbox rendering is temporarily disabled to ensure deployment stability. Live location would be shown here.)
            </p>
        </div>
    )
}
