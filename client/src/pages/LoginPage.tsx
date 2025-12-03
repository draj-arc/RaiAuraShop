import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { Mail, Lock, User, Sparkles, ArrowLeft, KeyRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// OTP Schema
const otpRequestSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const signupOtpRequestSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type LoginMethod = "password" | "otp";
type OTPStep = "request" | "verify";
type SignupStep = "form" | "otp";

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [otpStep, setOtpStep] = useState<OTPStep>("request");
  const [otpEmail, setOtpEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [signupData, setSignupData] = useState({ username: "", email: "" });
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const loginForm = useForm({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupOtpRequestSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const signupOtpForm = useForm({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const otpRequestForm = useForm({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpVerifyForm = useForm({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

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

  const handleSignup = async (data: z.infer<typeof signupOtpRequestSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/otp/request", {
        email: data.email,
        isNewUser: true,
        username: data.username,
      });
      const result = await res.json();
      
      if (res.ok) {
        setSignupData({ username: data.username, email: data.email });
        signupOtpForm.setValue("email", data.email);
        setSignupStep("otp");
        setDemoOtp(result.demo_otp || null);
        toast({
          title: "OTP Sent!",
          description: `A 6-digit verification code has been sent to ${data.email}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not send OTP",
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

  const handleSignupVerifyOTP = async (data: z.infer<typeof otpVerifySchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/otp/verify", {
        email: signupData.email,
        otp: data.otp,
      });
      const result = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast({
          title: "Account Created!",
          description: "Welcome to Rai Aura. Your account has been created successfully.",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Invalid OTP",
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

  const handleRequestOTP = async (data: z.infer<typeof otpRequestSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/otp/request", {
        email: data.email,
        isNewUser: false,
      });
      const result = await res.json();
      
      if (res.ok) {
        setOtpEmail(data.email);
        otpVerifyForm.setValue("email", data.email);
        setOtpStep("verify");
        setDemoOtp(result.demo_otp || null);
        
        toast({
          title: "OTP Sent!",
          description: `A 6-digit code has been sent to ${data.email}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: z.infer<typeof otpVerifySchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/otp/verify", {
        email: otpEmail,
        otp: data.otp,
      });
      const result = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast({
          title: "Welcome!",
          description: "You have been logged in successfully.",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Invalid OTP",
          description: result.message || "The code you entered is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOTPFlow = () => {
    setOtpStep("request");
    setOtpEmail("");
    setDemoOtp(null);
    otpRequestForm.reset();
    otpVerifyForm.reset();
  };

  const resetSignupFlow = () => {
    setSignupStep("form");
    setSignupData({ username: "", email: "" });
    setDemoOtp(null);
    signupForm.reset();
    signupOtpForm.reset();
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
      toast({
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
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
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent" />
        
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              {/* Login Method Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={loginMethod === "password" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setLoginMethod("password");
                    resetOTPFlow();
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === "otp" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod("otp")}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Email OTP
                </Button>
              </div>

              {loginMethod === "password" ? (
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
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pl-10" placeholder="you@example.com" data-testid="input-login-email" />
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
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="password" className="pl-10" placeholder="••••••••" data-testid="input-login-password" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={isLoading} data-testid="button-login">
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                /* OTP Login Flow */
                <div className="space-y-4">
                  {otpStep === "request" ? (
                    <Form {...otpRequestForm}>
                      <form onSubmit={otpRequestForm.handleSubmit(handleRequestOTP)} className="space-y-4">
                        <FormField
                          control={otpRequestForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input {...field} type="email" className="pl-10" placeholder="you@example.com" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-sm text-muted-foreground">
                          We'll send a 6-digit verification code to your email.
                        </p>
                        <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={isLoading}>
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Sending OTP...
                            </span>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send OTP
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...otpVerifyForm}>
                      <form onSubmit={otpVerifyForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mb-2 -ml-2"
                          onClick={resetOTPFlow}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                        
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Enter the 6-digit code sent to
                          </p>
                          <p className="font-medium">{otpEmail}</p>
                          {demoOtp && (
                            <p className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                              Demo OTP: {demoOtp}
                            </p>
                          )}
                        </div>
                        
                        <FormField
                          control={otpVerifyForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                              <FormControl>
                                <InputOTP maxLength={6} {...field}>
                                  <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={isLoading}>
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            <>
                              <KeyRound className="mr-2 h-4 w-4" />
                              Verify & Sign In
                            </>
                          )}
                        </Button>
                        
                        <p className="text-center text-sm text-muted-foreground">
                          Didn't receive the code?{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => handleRequestOTP({ email: otpEmail })}
                          >
                            Resend
                          </button>
                        </p>
                      </form>
                    </Form>
                  )}
                </div>
              )}

              {/* Google Sign In for Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4 hover-elevate"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              {signupStep === "form" ? (
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
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pl-10" placeholder="Your name" data-testid="input-signup-username" />
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
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pl-10" placeholder="you@example.com" data-testid="input-signup-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      We'll send a verification code to your email to complete signup.
                    </p>
                    <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={isLoading} data-testid="button-signup">
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending OTP...
                        </span>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Verification Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...signupOtpForm}>
                  <form onSubmit={signupOtpForm.handleSubmit(handleSignupVerifyOTP)} className="space-y-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-2 -ml-2"
                      onClick={resetSignupFlow}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to
                      </p>
                      <p className="font-medium">{signupData.email}</p>
                      {demoOtp && (
                        <p className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                          Demo OTP: {demoOtp}
                        </p>
                      )}
                    </div>
                    
                    <FormField
                      control={signupOtpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full hover-elevate active-elevate-2" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Verify & Create Account
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => handleSignup(signupData)}
                      >
                        Resend
                      </button>
                    </p>
                  </form>
                </Form>
              )}

              {/* Google Sign Up */}
              {signupStep === "form" && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 hover-elevate"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </div>
              )}
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                By signing up, you agree to our{" "}
                <Link href="/policies" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/policies" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
