"use client"

import { useState, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

// You would generate a token from mapbox
// Default to a fallback center if coords are missing
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function EventMap({ eventId, initLat, initLng, startsAt, locationVisibility }: any) {
    const [viewState, setViewState] = useState({
        longitude: initLng || -74.006, // NYC default
        latitude: initLat || 40.7128,
        zoom: 13
    })

    // To comply with the 20 minute rule dynamically on the frontend:
    // In a real app we would establish a WebSocket or SWR / React Query polling here for the LocationPings
    // Only fetching if the time is within 20 mins before startsAt

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
                Mapbox integration pending (Configure NEXT_PUBLIC_MAPBOX_TOKEN in .env)
            </div>
        )
    }

    return (
        <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
        >
            <NavigationControl position="top-right" />
            {initLat !== 0 && initLng !== 0 && (
                <Marker longitude={initLng} latitude={initLat} anchor="bottom">
                    <MapPin className="text-red-600 w-8 h-8 fill-red-100/50" />
                </Marker>
            )}
            {/* Dynamic User Markers would map here */}
        </Map>
    )
}
