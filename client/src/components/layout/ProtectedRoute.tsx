import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");

            if (!token || !userData) {
                toast({
                    title: "Access Denied",
                    description: "Please log in to access this page.",
                    variant: "destructive",
                });
                setLocation("/login");
                setIsAuthorized(false);
                return;
            }

            try {
                const user = JSON.parse(userData);
                if (adminOnly && !user.isAdmin) {
                    toast({
                        title: "Unauthorized",
                        description: "You do not have permission to view this page.",
                        variant: "destructive",
                    });
                    setLocation("/");
                    setIsAuthorized(false);
                    return;
                }
                setIsAuthorized(true);
            } catch (err) {
                setLocation("/login");
                setIsAuthorized(false);
            }
        };

        checkAuth();
    }, [adminOnly, setLocation, toast]);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
