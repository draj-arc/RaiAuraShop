import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { Mail, User, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, sendEmailLink, isEmailLink, completeEmailSignIn } from "@/lib/firebase";

// Email Schema for Sign In
const signInEmailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

// Email Schema for Sign Up
const signUpEmailSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type AuthStep = "form" | "otp" | "emailSent";

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Magic Link Handler
  useEffect(() => {
    if (isEmailLink(window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      const authMode = window.localStorage.getItem('authMode') || 'signin'; // 'signin' | 'signup'

      if (!email) {
        // User opened link on different device. Ask for email.
        email = window.prompt('Please provide your email for confirmation');
      }

      if (email) {
        setIsLoading(true);
        completeEmailSignIn(email, window.location.href)
          .then(async (result) => {
            // Verify with backend to get JWT token
            const user = result.user;
            const storedUsername = window.localStorage.getItem('signupUsername');

            const res = await apiRequest("POST", "/api/auth/firebase-email", {
              email: user.email,
              username: storedUsername || user.displayName || user.email?.split('@')[0],
              firebaseUid: user.uid,
              isNewUser: authMode === 'signup'
            });

            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || "Failed to authenticate with server");
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Set dark mode as default upon login
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add("dark");

            // Clean up
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('authMode');
            window.localStorage.removeItem('signupData');

            const isNew = data.isNewUserCreated;

            toast({
              title: isNew ? "Account Created!" : "Welcome back!",
              description: isNew ? "Your account has been successfully created." : "Successfully authenticated with Magic Link",
            });
            setLocation("/dashboard");
          })
          .catch((error) => {
            console.error("Magic Link Error", error);
            toast({
              title: "Authentication Failed",
              description: error.message || "Invalid or expired link",
              variant: "destructive",
            });
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [setLocation, toast]);

  // Sign In state
  const [signInStep, setSignInStep] = useState<AuthStep>("form");
  const [signInEmail, setSignInEmail] = useState("");

  // Sign Up state
  const [signUpStep, setSignUpStep] = useState<AuthStep>("form");
  const [signUpData, setSignUpData] = useState({ username: "", email: "" });

  const signInForm = useForm({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const signUpForm = useForm({
    resolver: zodResolver(signUpEmailSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  // NOTE: magic-link email flows removed in favor of OTP-based flows

  // Sign In - Send Magic Link
  const handleSignIn = async (data: z.infer<typeof signInEmailSchema>) => {
    setIsLoading(true);
    try {
      // Check if user exists first
      const checkRes = await apiRequest("POST", "/api/auth/check-email", { email: data.email });
      const checkData = await checkRes.json();

      if (!checkData.exists) {
        toast({
          title: "Account not found",
          description: "No account found with this email. Please create an account first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await sendEmailLink(data.email);
      window.localStorage.setItem('authMode', 'signin');
      setSignInEmail(data.email);
      setSignInStep("emailSent");

      toast({
        title: "Magic Link Sent!",
        description: `We've sent a sign-in link to ${data.email}.`,
      });
    } catch (error: any) {
      console.error("Send Link error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send login link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up - Send Magic Link
  const handleSignUp = async (data: z.infer<typeof signUpEmailSchema>) => {
    setIsLoading(true);
    try {
      // First check if email already exists
      const checkRes = await apiRequest("POST", "/api/auth/check-email", { email: data.email });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // store signup data locally for use after verify if needed, 
      // though for magic link we mostly need the email (handled by firebase)
      // and username (which we should cache to update profile later if needed, but existing backend handles it via 'username' param if sent?)
      // Wait, completeEmailSignIn doesn't pass username. 
      // But we can store it in localStorage and use it in useEffect.
      window.localStorage.setItem('signupUsername', data.username);

      await sendEmailLink(data.email);
      window.localStorage.setItem('authMode', 'signup');

      setSignUpData({ username: data.username, email: data.email });
      setSignUpStep("emailSent"); // Reusing emailSent step for Sign Up too

      toast({
        title: "Magic Link Sent!",
        description: `We've sent a verification link to ${data.email}.`,
      });
    } catch (error: any) {
      console.error("Send Link error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send verification link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Magic Link (Sign In) or OTP (Sign Up)
  const resendAction = async (email: string, isSignUp: boolean) => {
    // Resend Magic Link for both flows now
    setIsLoading(true);
    try {
      await sendEmailLink(email);
      toast({
        title: "Link Sent!",
        description: `We've sent another magic link to ${email}.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification UI component
  const OTPVerificationUI = ({ email, onBack, isSignUp = false }: { email: string; onBack: () => void; isSignUp?: boolean }) => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const verify = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("POST", "/api/otp/verify", { email, otp: code });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid OTP');

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.localStorage.removeItem('signupData');
        toast({ title: isSignUp ? 'Account created' : 'Signed in', description: data.message });
        setLocation("/dashboard");
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'OTP verification failed', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 py-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
          <p className="font-medium">{email}</p>
        </div>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter OTP" />
        <div className="flex gap-2">
          <Button onClick={verify} className="flex-1" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</Button>
          <Button variant="ghost" onClick={onBack}>Use different email</Button>
        </div>
      </div>
    );
  };

  // Reset flows
  const resetSignInFlow = () => {
    setSignInStep("form");
    setSignInEmail("");
    signInForm.reset();
  };

  const resetSignUpFlow = () => {
    setSignUpStep("form");
    setSignUpData({ username: "", email: "" });
    signUpForm.reset();
    window.localStorage.removeItem('signupData');
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await apiRequest("POST", "/api/auth/google", {
        email: user.email,
        username: user.displayName || user.email?.split('@')[0],
        googleId: user.uid,
        photoURL: user.photoURL,
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Set dark mode as default upon login
        localStorage.setItem("theme", "dark");
        document.documentElement.classList.add("dark");
        toast({
          title: data.isNewUserCreated ? "Account Created!" : "Welcome Back!",
          description: `Signed in as ${user.displayName || user.email}`,
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Error",
          description: data.message || "Could not complete sign in",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      let errorMessage = "Could not sign in with Google. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = "This domain is not authorized. Please contact support.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }

      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sent Success UI
  const EmailSentUI = ({ email, onResend, onBack, isSignUp = false }: {
    email: string;
    onResend: () => void;
    onBack: () => void;
    isSignUp?: boolean;
  }) => (
    <div className="text-center space-y-4 py-6">
      <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="font-semibold text-xl">Check your email!</h3>
        <p className="text-sm text-muted-foreground mt-2">
          We've sent a magic link to<br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="text-muted-foreground">
          Click the link in the email to {isSignUp ? "complete your registration" : "sign in"}.
          The link will expire in 1 hour.
        </p>
      </div>
      <div className="space-y-2 pt-2">
        <Button
          variant="secondary"
          onClick={onResend}
          disabled={isLoading}
          className="w-full border"
        >
          {isLoading ? "Sending..." : "Resend Magic Link"}
        </Button>
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Use different email
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-accent/10">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent" />

        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex justify-center">
            <Logo size="lg" />
          </Link>
          <div>
            <CardTitle className="text-2xl font-serif flex items-center justify-center gap-2">
              Welcome to Rai Aura
              <Sparkles className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription className="mt-2">
              Sign in with your email - no password needed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            {/* SIGN IN TAB */}
            <TabsContent value="signin" className="space-y-4">
              {signInStep === "form" ? (
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full luxury-button" disabled={isLoading}>
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Send Magic Link"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We'll send you a magic link to sign in securely without a password.
                    </p>
                  </form>
                </Form>
              ) : signInStep === 'otp' ? (
                // Should not happen for login anymore, but kept for type safety
                <OTPVerificationUI email={signInEmail} onBack={resetSignInFlow} isSignUp={false} />
              ) : (
                <EmailSentUI
                  email={signInEmail}
                  onResend={() => resendAction(signInEmail, false)}
                  onBack={resetSignInFlow}
                  isSignUp={false}
                />
              )}

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full border"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="signup" className="space-y-4">
              {signUpStep === "form" ? (
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} placeholder="Your name" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full luxury-button" disabled={isLoading}>
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Send Verification Link"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We'll send you a magic link to verify your email and create your account.
                    </p>
                  </form>
                </Form>
              ) : signUpStep === 'otp' ? (
                <OTPVerificationUI email={signUpData.email} onBack={resetSignUpFlow} isSignUp={true} />
              ) : (
                <EmailSentUI
                  email={signUpData.email}
                  onResend={() => resendAction(signUpData.email, true)}
                  onBack={resetSignUpFlow}
                  isSignUp={true}
                />
              )}

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or sign up with
                </span>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full border"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/policies" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/policies" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
