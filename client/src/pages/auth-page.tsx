import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      bio: "",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg", // Default avatar
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In | DSAC - Data Structure & Algorithm Club</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <Tabs
                  defaultValue="login"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-slate-200 dark:border-slate-700">
                    <TabsList className="w-full rounded-none bg-slate-50 dark:bg-slate-800">
                      <TabsTrigger
                        value="login"
                        className="flex-1 py-4 data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="flex-1 py-4 data-[state=active]:shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="login" className="p-6">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                      <p className="text-slate-600 dark:text-slate-400">
                        Sign in to your DSAC account
                      </p>
                    </div>

                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your username"
                                  {...field}
                                />
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
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{" "}
                        <button
                          className="text-primary hover:underline font-medium"
                          onClick={() => setActiveTab("register")}
                        >
                          Register
                        </button>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="p-6">
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold mb-2">
                        Create an account
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400">
                        Join the Data Structure & Algorithm Club
                      </p>
                    </div>

                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Choose a username"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your full name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Your email address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tell us about yourself"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?{" "}
                        <button
                          className="text-primary hover:underline font-medium"
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <div className="text-center lg:text-left lg:max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
                  Join the Data Structure & Algorithm Club
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                  Connect with fellow coders, enhance your problem-solving
                  skills, and prepare for technical interviews.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Coding Contests</h3>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Participate in regular coding competitions to sharpen your skills.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Networking Opportunities</h3>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Connect with like-minded students and industry professionals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Interview Preparation</h3>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Get ready for technical interviews with mock sessions and expert feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
