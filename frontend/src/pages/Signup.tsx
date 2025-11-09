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

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      // Removed duplicated inline error message for password mismatch
      // setServerMessage("Passwords do not match");
      // setIsError(true);
      return;
    }

    setIsLoading(true);
    setServerMessage(null);
    try {
      const name = data.email.split("@")[0];
      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        {
          name,
          email: data.email,
          password: data.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast({
        title: "Success!",
        description:
          response.data.message || "Account created successfully. Welcome!",
      });

      const token = response.data.accessToken || response.data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      reset();
      setTimeout(() => navigate("/signin"), 1500);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      setServerMessage(msg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 via-white dark:via-gray-950 to-green-100 dark:to-gray-900 px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border border-green-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 animate-fadeIn">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-extrabold text-green-600 dark:text-green-500 tracking-tight">
            PeerCall
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
            Create your account to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-2">
          {/* Message Area (prevents layout shift) */}
          {serverMessage && (
            <div
              className={`text-center text-sm mb-4 px-3 py-2 rounded-lg transition-all duration-300 ${
                isError
                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              }`}
            >
              {serverMessage}
            </div>
          )}

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

            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              className="w-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 rounded-lg py-3 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 mt-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-green-600 dark:text-green-500 font-medium hover:underline hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;