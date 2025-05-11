import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/AuthContext"
import { registerSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/Icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"

export default function Register() {
    const { register, initiateGoogleAuth, setToken } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    // Handle Google auth callback
    useEffect(() => {
        const query = new URLSearchParams(location.search)
        const token = query.get('token')
        const error = query.get('error')

        if (token) {
            setToken(token)
            toast.success("Successfully registered with Google!")
            navigate('/dashboard')
        } else if (error) {
            toast.error("Google registration failed. Please try again.")
        }
    }, [location, setToken, navigate])

    async function onSubmit(values) {
        setIsLoading(true)
        try {
            await register(values)
            toast.success("Verification email sent! Please check your inbox.")
           form.reset()
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setIsLoading(true)
        try {
            await initiateGoogleAuth()
        } catch (error) {
            toast.error("Google authentication failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl sm:text-3xl">Create an account</CardTitle>
                        <CardDescription>
                            Enter your details below to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Create a password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Confirm your password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign Up
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleGoogleAuth} disabled={isLoading}>
                            <img src="/google.svg" alt="Google" className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="hover:text-primary">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}