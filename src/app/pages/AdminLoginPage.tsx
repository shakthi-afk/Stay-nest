import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";

// ==== ADMIN CREDENTIALS ====
const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PASSWORD = "admin123";

export function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setIsLoading(true);

        // Check against hardcoded admin credentials
        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            localStorage.setItem("isAdminAuthenticated", "true");
            toast.success("Admin access granted.");
            navigate("/admin");
        } else {
            toast.error("Invalid credentials. Access denied.");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                        <ShieldCheck className="size-12 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage the platform</p>
                </div>

                <Card className="shadow-xl border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Authentication Required</CardTitle>
                        <CardDescription className="text-center">
                            Enter your administrator credentials below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdminLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Administrator Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin123@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-50 pl-9"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Authenticating..." : "Login to Admin Dashboard"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center mt-8">
                    <Button variant="link" onClick={() => navigate("/")} className="text-slate-500">
                        ← Return to public site
                    </Button>
                </div>
            </div>
        </div>
    );
}
