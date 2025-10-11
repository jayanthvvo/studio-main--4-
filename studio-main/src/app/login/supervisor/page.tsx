"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThesisFlowLogo } from "@/components/logo";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from "react"; // Import React

export default function SupervisorLoginPage() {
  const [email, setEmail] = useState("supervisor@supervisor.in");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    console.log("Forgot Password clicked. Attempting to send reset email to:", email);

    if (!email) {
        console.log("Email field is empty.");
        toast({
            title: "Email Required",
            description: "Please enter your email address to reset your password.",
            variant: "destructive",
        });
        return;
    }

    const auth = getAuth(app);
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Firebase password reset email sent successfully.");
        toast({
            title: "Password Reset Email Sent",
            description: "Check your inbox for a link to reset your password.",
        });
    } catch (error: any) {
        console.error("Password Reset Error:", error);
        toast({
            title: "Error Sending Reset Email",
            description: `Firebase error: ${error.code} - ${error.message}`,
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <ThesisFlowLogo className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">ThesisFlow</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Supervisor Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4" suppressHydrationWarning>
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="supervisor@supervisor.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <div className="text-right">
                  <Button variant="link" size="sm" onClick={handlePasswordReset} type="button" className="p-0 h-auto">
                      Forgot Password?
                  </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground justify-center">
            Don&apos;t have an account? <Button variant="link" asChild className="p-1"><Link href="/register/supervisor">Register</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}