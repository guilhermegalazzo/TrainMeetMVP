"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { profileSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function ProfileForm({ initialData }: { initialData: any }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: initialData.name || '',
            bio: initialData.bio || '',
            city: initialData.city || '',
            level: initialData.level || 'INTERMEDIATE',
            publicProfile: initialData.publicProfile,
            allowInvites: initialData.allowInvites,
            favoriteSports: initialData.favoriteSports || [],
        }
    })

    async function onSubmit(data: z.infer<typeof profileSchema>) {
        try {
            setIsSubmitting(true)
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error()

            toast.success('Profile updated successfully!')
            router.refresh()
        } catch (error) {
            toast.error('Failed to update profile.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="level" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fitness Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl><Textarea placeholder="Tell others about your goals..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="pt-6 border-t space-y-4">
                    <h3 className="text-lg font-bold text-slate-800">Privacy & Permissions</h3>

                    <FormField control={form.control} name="publicProfile" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Public Profile</FormLabel>
                                <FormDescription>Allow others to discover your profile on the app.</FormDescription>
                            </div>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="allowInvites" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Allow Event Invitations</FormLabel>
                                <FormDescription>Let others send you invitations to events.</FormDescription>
                            </div>
                        </FormItem>
                    )} />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>

            </form>
        </Form>
    )
}
