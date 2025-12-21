import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { Mail, Lock, User, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, sendEmailLink, isEmailLink, completeEmailSignIn } from "@/lib/firebase";

// Email Link Schema
const emailLinkSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const signupEmailSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type LoginMethod = "password" | "emailLink";
type EmailLinkStep = "request" | "sent";
type SignupStep = "form" | "sent";

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [emailLinkStep, setEmailLinkStep] = useState<EmailLinkStep>("request");
  const [emailForLink, setEmailForLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [signupData, setSignupData] = useState({ username: "", email: "" });

  const loginForm = useForm({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupEmailSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const emailLinkForm = useForm({
    resolver: zodResolver(emailLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle email link sign-in when page loads (after user clicks the link in email)
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isEmailLink(window.location.href)) {
        setIsLoading(true);
        // Get the email from localStorage (saved when we sent the link)
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // If email is not in localStorage, ask the user for it
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          try {
            const result = await completeEmailSignIn(email, window.location.href);
            const user = result.user;
            
            // Get stored signup data if this was a new user
            const storedSignupData = window.localStorage.getItem('signupData');
            const isNewUser = storedSignupData !== null;
            const parsedSignupData = storedSignupData ? JSON.parse(storedSignupData) : null;
            
            // Send to our backend to create/login user
            const res = await apiRequest("POST", "/api/auth/firebase-email", {
              email: user.email,
              username: parsedSignupData?.username || user.email?.split('@')[0],
              firebaseUid: user.uid,
              isNewUser,
            });
            const data = await res.json();
            
            if (res.ok) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("user", JSON.stringify(data.user));
              // Clean up
              window.localStorage.removeItem('signupData');
              
              toast({
                title: isNewUser ? "Account Created!" : "Welcome back!",
                description: isNewUser 
                  ? "Your account has been created successfully."
                  : "You have been logged in successfully.",
              });
              
              // Clear the URL parameters
              window.history.replaceState({}, document.title, window.location.pathname);
              setLocation("/dashboard");
            } else {
              toast({
                title: "Error",
                description: data.message || "Could not complete sign in",
                variant: "destructive",
              });
            }
          } catch (error: any) {
            console.error("Email link sign-in error:", error);
            let errorMessage = "Could not complete sign in. The link may have expired.";
            
            if (error.code === "auth/invalid-action-code") {
              errorMessage = "This sign-in link has expired or already been used. Please request a new one.";
            } else if (error.code === "auth/expired-action-code") {
              errorMessage = "This sign-in link has expired. Please request a new one.";
            }
            
            toast({
              title: "Sign In Failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
        setIsLoading(false);
      }
    };
    
    handleEmailLinkSignIn();
  }, []);

  const handleLogin = async (data: z.infer<typeof loginUserSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/login", data);
      const result = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: z.infer<typeof signupEmailSchema>) => {
    setIsLoading(true);
    try {
      // Store signup data for when user clicks the email link
      window.localStorage.setItem('signupData', JSON.stringify({
        username: data.username,
        email: data.email,
      }));
      
      // Send Firebase email link
      await sendEmailLink(data.email);
      
      setSignupData({ username: data.username, email: data.email });
      setSignupStep("sent");
      
      toast({
        title: "Check your email!",
        description: `We've sent a sign-in link to ${data.email}. Click the link to complete your registration.`,
      });
    } catch (error: any) {
      console.error("Send email link error:", error);
      let errorMessage = "Could not send sign-in link. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailLink = async (data: z.infer<typeof emailLinkSchema>) => {
    setIsLoading(true);
    try {
      // Send Firebase email link for login
      await sendEmailLink(data.email);
      
      setEmailForLink(data.email);
      setEmailLinkStep("sent");
      
      toast({
        title: "Check your email!",
        description: `We've sent a sign-in link to ${data.email}. Click the link to sign in.`,
      });
    } catch (error: any) {
      console.error("Send email link error:", error);
      let errorMessage = "Could not send sign-in link. Please try again.";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "Too many requests. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmailLinkFlow = () => {
    setEmailLinkStep("request");
    setEmailForLink("");
    emailLinkForm.reset();
  };

  const resetSignupFlow = () => {
    setSignupStep("form");
    setSignupData({ username: "", email: "" });
    signupForm.reset();
    window.localStorage.removeItem('signupData');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send Google user info to our backend
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
        toast({
          title: "Welcome!",
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
        errorMessage = "This domain is not authorized for Google Sign-In. Please add localhost to Firebase authorized domains.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
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

  const resendEmailLink = async (email: string) => {
    setIsLoading(true);
    try {
      await sendEmailLink(email);
      toast({
        title: "Email sent!",
        description: `We've sent another sign-in link to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-accent/10">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative overflow-hidden">
        {/* Decorative corner accent */}
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
              Sign in to access your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4">
              {/* Login Method Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={loginMethod === "password" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setLoginMethod("password"); resetEmailLinkFlow(); }}
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Password
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === "emailLink" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setLoginMethod("emailLink"); loginForm.reset(); }}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email Link
                </Button>
              </div>

              {/* Password Login */}
              {loginMethod === "password" && (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
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
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="password" placeholder="••••••••" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full luxury-button" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              )}

              {/* Email Link Login */}
              {loginMethod === "emailLink" && (
                <>
                  {emailLinkStep === "request" && (
                    <Form {...emailLinkForm}>
                      <form onSubmit={emailLinkForm.handleSubmit(handleSendEmailLink)} className="space-y-4">
                        <FormField
                          control={emailLinkForm.control}
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
                          {isLoading ? "Sending..." : "Send Sign-In Link"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          We'll send you a magic link to sign in instantly
                        </p>
                      </form>
                    </Form>
                  )}

                  {emailLinkStep === "sent" && (
                    <div className="text-center space-y-4 py-4">
                      <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Check your email!</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          We've sent a sign-in link to<br />
                          <span className="font-medium text-foreground">{emailForLink}</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Click the link in the email to sign in. The link will expire in 1 hour.
                      </p>
                      <div className="space-y-2 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => resendEmailLink(emailForLink)} 
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? "Sending..." : "Resend Email"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={resetEmailLinkFlow} 
                          className="w-full"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Use different email
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="space-y-4">
              {signupStep === "form" && (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
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
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
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
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We'll send you a sign-in link to verify your email
                    </p>
                  </form>
                </Form>
              )}

              {signupStep === "sent" && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Check your email!</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      We've sent a verification link to<br />
                      <span className="font-medium text-foreground">{signupData.email}</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the link in the email to complete your registration. The link will expire in 1 hour.
                  </p>
                  <div className="space-y-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => resendEmailLink(signupData.email)} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Sending..." : "Resend Email"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={resetSignupFlow} 
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Use different email
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or sign up with
                </span>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
