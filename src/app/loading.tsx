import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse pt-8 p-4">
            <div className="space-y-3">
                <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200" />
                <Skeleton className="h-5 w-1/2 rounded-xl bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex flex-col space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-2xl bg-slate-200" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px] bg-slate-200" />
                            <Skeleton className="h-4 w-[200px] bg-slate-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
