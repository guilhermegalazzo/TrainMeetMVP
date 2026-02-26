"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { eventSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

type EventFormValues = z.infer<typeof eventSchema>

export default function CreateEventForm({ sports }: { sports: any[] }) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formSchema = eventSchema.extend({
        startsAt: z.coerce.date().transform(d => d.toISOString()).pipe(z.string().datetime()),
        endsAt: z.coerce.date().transform(d => d.toISOString()).pipe(z.string().datetime()),
    }) as unknown as z.ZodType<EventFormValues>

    const form = useForm<EventFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'PUBLIC',
            requireApproval: false,
            guestsCanInvite: true,
            locationVisibility: 'CONFIRMED_ONLY',
        }
    })

    async function onSubmit(data: EventFormValues) {
        try {
            setIsSubmitting(true)
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                throw new Error('Failed to create event')
            }

            const event = await res.json()
            toast.success('Event created successfully!')
            router.push(`/events/${event.id}`)
            router.refresh()
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = () => {
        if (step === 1) {
            form.trigger(['title', 'sportId', 'type']).then(valid => {
                if (valid) setStep(2)
            })
        } else if (step === 2) {
            form.trigger(['startsAt', 'endsAt', 'address']).then(valid => {
                if (valid) setStep(3)
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-100 -z-10" />
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {s}
                        </div>
                    ))}
                </div>

                {/* Form Steps */}
                <div className="min-h-[300px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-2">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800">Basic Details</h2>
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Morning 10k Run" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="sportId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sport</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a sport" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sports.map(sport => (
                                                <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Details about pace, goals, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-2">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800">When & Where</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="startsAt" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Starts At</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="endsAt" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ends At</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting Point / Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Central Park Entrance" {...field} />
                                    </FormControl>
                                    <FormDescription>Where should people meet?</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-2">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800">Privacy & Settings</h2>

                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PUBLIC">Public (Any athlete can find and join)</SelectItem>
                                            <SelectItem value="PRIVATE">Private (Invite only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="locationVisibility" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Live Location Sharing Rules</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rule" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CONFIRMED_ONLY">Confirmed Participants Only</SelectItem>
                                            <SelectItem value="ALL">Everyone in the app</SelectItem>
                                            <SelectItem value="NONE">Disable Live Location Sharing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Who can see the shared map 20 mins before?</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="pt-4 space-y-4 border-t mt-4">
                                <FormField control={form.control} name="guestsCanInvite" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Guests can invite others</FormLabel>
                                            <FormDescription>Allow participants to generate invites.</FormDescription>
                                        </div>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                        Previous
                    </Button>

                    {step < 3 ? (
                        <Button type="button" onClick={nextStep} className="bg-amber-500 hover:bg-amber-600">
                            Continue
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </Button>
                    )}
                </div>

            </form>
        </Form>
    )
}
