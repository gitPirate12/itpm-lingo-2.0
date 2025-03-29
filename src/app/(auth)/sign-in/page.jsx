"use client";
import { useState } from 'react';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user) {
    router.push("/"); // Redirect to home if already logged in
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <SignInForm />
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: "/" // Redirect to home after successful login
    });

    if (result?.error) {
      toast.error('Login failed', {
        description: result.error,
        position: 'top-center'
      });
    } else {
      toast.success('Login successful', {
        position: 'top-center'
      });
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ITPM-LINGO</h1>
        <p className="text-gray-600 text-sm md:text-base">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push('/sign-up')}
            className="text-gray-600 hover:text-gray-900 text-xs md:text-sm font-medium"
          >
            Don't have an account?{' '}
            <span className="text-gray-900 font-semibold underline">
              Sign Up
            </span>
          </button>
        </div>
      </form>

      <div className="relative my-4 md:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300/50"></div>
        </div>
        <div className="relative flex justify-center text-xs md:text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex items-center justify-center gap-1 md:gap-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg py-2 px-2 md:py-3 md:px-4 transition-all duration-200 text-xs md:text-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
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
          <span className="text-gray-900">Google</span>
        </button>

        <button
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="flex items-center justify-center gap-1 md:gap-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg py-2 px-2 md:py-3 md:px-4 transition-all duration-200 text-xs md:text-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.79-.26.79-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.19.694.8.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"
              fill="currentColor"
            />
          </svg>
          <span className="text-gray-900">GitHub</span>
        </button>
      </div>
    </div>
  );
}