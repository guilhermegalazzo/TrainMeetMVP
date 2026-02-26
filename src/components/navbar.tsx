"use client"
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Map, Calendar, Plus, Bell } from 'lucide-react'

export default function Navbar() {
    const { isLoaded, isSignedIn } = useUser();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left Side: Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            TM
                        </div>
                        <span className="font-bold text-xl inline-block text-slate-800">TrainMeet</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/explore" className="hover:text-amber-600 transition-colors flex items-center gap-2">
                            <Map className="w-4 h-4" /> Explore
                        </Link>
                        <Link href="/calendar" className="hover:text-amber-600 transition-colors flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Calendar
                        </Link>
                    </nav>
                </div>

                {/* Right Side: Auth / CTA */}
                <div className="flex items-center space-x-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="outline" className="text-slate-700">Sign In</Button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <Link href="/events/create" className="hidden sm:flex">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Create Event
                            </Button>
                        </Link>
                        <Link href="/notifications">
                            <Button variant="ghost" size="icon" className="text-slate-600 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>

            </div>
        </header>
    )
}
