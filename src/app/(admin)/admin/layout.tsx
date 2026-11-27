import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: { default: "Control room", template: "%s | Bustani admin"},
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
    return <div className="mx-auto min-h-dvh w-full max-w 5x1 px-5">{children}</div>;
}