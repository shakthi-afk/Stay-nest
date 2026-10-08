import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

// Simple local user store (since we're migrating from Supabase to MongoDB)
const USERS_KEY = "app_users";

function getUsers(): Record<string, { name: string; email: string; password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, setIsLoggedIn, setUser } = useApp();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!loginEmail) newErrors.loginEmail = "Email is required";
    if (!loginPassword) newErrors.loginPassword = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all fields");
      return;
    }

    const users = getUsers();
    const match = users[loginEmail.toLowerCase()];

    if (!match || match.password !== loginPassword) {
      toast.error("Invalid email or password");
      return;
    }

    const userData = { name: match.name, email: match.email, id: loginEmail.toLowerCase() };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);

    setShowLoginModal(false);
    toast.success("Logged in successfully!");
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!signupName) newErrors.signupName = "Full name is required";
    if (!signupEmail) {
      newErrors.signupEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      newErrors.signupEmail = "Invalid email format";
    }
    if (!signupPassword) newErrors.signupPassword = "Password is required";
    if (!signupConfirmPassword) newErrors.signupConfirmPassword = "Confirm password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrors(prev => ({ ...prev, signupConfirmPassword: "Passwords do not match" }));
      toast.error("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setErrors(prev => ({ ...prev, signupPassword: "Password must be at least 6 characters" }));
      toast.error("Password must be at least 6 characters");
      return;
    }

    const users = getUsers();
    const key = signupEmail.toLowerCase();

    if (users[key]) {
      toast.error("An account with this email already exists");
      return;
    }

    users[key] = { name: signupName, email: signupEmail, password: signupPassword };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const userData = { name: signupName, email: signupEmail, id: key };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);

    setShowLoginModal(false);
    toast.success("Account created successfully!");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to {import.meta.env.VITE_APP_NAME || "StayNest"}</DialogTitle>
          <DialogDescription>
            Login or create an account to continue
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className={errors.loginEmail ? "text-red-500" : ""}>Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (errors.loginEmail) setErrors(prev => ({ ...prev, loginEmail: "" }));
                  }}
                  className={errors.loginEmail ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.loginEmail && <p className="text-xs text-red-500 mt-1">{errors.loginEmail}</p>}
              </div>

              <div>
                <Label htmlFor="login-password" className={errors.loginPassword ? "text-red-500" : ""}>Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (errors.loginPassword) setErrors(prev => ({ ...prev, loginPassword: "" }));
                  }}
                  className={errors.loginPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.loginPassword && <p className="text-xs text-red-500 mt-1">{errors.loginPassword}</p>}
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

              <p className="text-xs text-center text-gray-500">
                Demo: Use any email and password to login
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className={errors.signupName ? "text-red-500" : ""}>Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    if (errors.signupName) setErrors(prev => ({ ...prev, signupName: "" }));
                  }}
                  className={errors.signupName ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.signupName && <p className="text-xs text-red-500 mt-1">{errors.signupName}</p>}
              </div>

              <div>
                <Label htmlFor="signup-email" className={errors.signupEmail ? "text-red-500" : ""}>Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (errors.signupEmail) setErrors(prev => ({ ...prev, signupEmail: "" }));
                  }}
                  className={errors.signupEmail ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.signupEmail && <p className="text-xs text-red-500 mt-1">{errors.signupEmail}</p>}
              </div>

              <div>
                <Label htmlFor="signup-password" className={errors.signupPassword ? "text-red-500" : ""}>Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (errors.signupPassword) setErrors(prev => ({ ...prev, signupPassword: "" }));
                  }}
                  className={errors.signupPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.signupPassword && <p className="text-xs text-red-500 mt-1">{errors.signupPassword}</p>}
              </div>

              <div>
                <Label htmlFor="signup-confirm-password" className={errors.signupConfirmPassword ? "text-red-500" : ""}>Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    if (errors.signupConfirmPassword) setErrors(prev => ({ ...prev, signupConfirmPassword: "" }));
                  }}
                  className={errors.signupConfirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.signupConfirmPassword && <p className="text-xs text-red-500 mt-1">{errors.signupConfirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full">
                Create Account
              </Button>

              <p className="text-xs text-center text-gray-500">
                By signing up, you agree to our Terms & Conditions
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
