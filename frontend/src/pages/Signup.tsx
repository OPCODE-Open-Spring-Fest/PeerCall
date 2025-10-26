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

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
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
      return;
    }

    setIsLoading(true);
    try {
      const name = data.email.split("@")[0];

      const response = await axios.post(
        "http://localhost:3000/api/auth/signup",
        {
          name,
          email: data.email,
          password: data.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast({
        title: "Success!",
        description:
          response.data.message || "Account created successfully. Welcome!",
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      reset();
      navigate("/signin");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4 py-8">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl border border-green-100 rounded-2xl p-6 animate-fadeIn">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-extrabold text-green-600 tracking-tight">
            PeerCall
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Create your account to get started
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
              className="w-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 rounded-lg py-3 font-medium shadow-md hover:shadow-lg"
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

        <CardFooter className="flex flex-col space-y-2 mt-4">
          <div className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-green-600 font-medium hover:underline hover:text-green-700 transition-colors"
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
