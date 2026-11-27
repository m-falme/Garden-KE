import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
    return (
        <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 py-10">
            <div className="flex flex-col gap-1">
                <h1 className="font-heading text-3xl font-bold tracking-tight">
                    Control room
                </h1>  
                <p className="text-sm text-muted-foreground">
                    Sign in to manage bookings.
                </p>
            </div>
            <LoginForm/>
        </main>
    );
}