import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { InputField } from "../components/InputField";
import { toast } from "../hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SignInData {
  email: string;
  password: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInData>();

  const onSubmit = async (data: SignInData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/signin`,
        { email: data.email, password: data.password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      toast({
        title: "Welcome back!",
        description: response.data.message || "Login successful",
      });

      const token = response.data.accessToken || response.data.token || null;
      if (token) {
        localStorage.setItem("token", token);
      }

      reset();
      navigate("/"); // redirect to home/dashboard
    } catch (error: any) {
      // Handle rate limiting errors
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 15;
        const minutes = Math.ceil(retryAfter / 60);
        toast({
          title: "Too Many Attempts",
          description: `Too many login attempts. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Launch OAuth
  const startGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const startGithub = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 via-white dark:via-gray-950 to-green-100 dark:to-gray-900 px-4 py-8">
      <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl border border-green-100 dark:border-gray-800 rounded-2xl p-6 animate-fadeIn">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-extrabold text-green-600 dark:text-green-500 tracking-tight">
            PeerCall
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
            Sign in to continue to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={errors.email?.message}
            />

            <InputField
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 rounded-lg py-3 font-medium shadow-md hover:shadow-lg"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* OAuth Section */}
          <div className="mt-8">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
              — Or continue with —
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={startGoogle}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-sm font-medium transition"
                type="button"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                Google
              </button>

              <button
                onClick={startGithub}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-sm font-medium transition"
                type="button"
              >
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  alt="GitHub logo"
                  className="w-5 h-5"
                />
                GitHub
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
              You will be redirected to the provider to complete sign-in.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 dark:text-green-500 font-medium hover:underline hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
