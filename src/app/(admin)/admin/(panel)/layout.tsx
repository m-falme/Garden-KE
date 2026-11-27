import { Suspense, type ReactNode } from "react";
import { signOutAdmin } from "@/app/actions/admin-auth";

export default function PanelLayout({ children }: { children: ReactNode}) {
    return (
        <div className="flex flex-col gap-6 py-6">
            <header className="flex items-center justify-between gap-4 border-b pb-4">
                <span className="font-heading text-xl font-bold">
                    Bustani control room
                </span>
                <form action={signOutAdmin}>
                    <button type="submit" className="h-11 rounded-full border px-5 text-sm font-medium">
                        Sign Out
                    </button>
                </form>
            </header>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
                {children}
            </Suspense>
        </div>
    );
} 