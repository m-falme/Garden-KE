import type { ReactNode } from "react";
import {BottomNav } from "@/components/bottom-nav";

export default function BrowseLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="pb-24">{children}</div>
            <BottomNav />
        </>
    );
}