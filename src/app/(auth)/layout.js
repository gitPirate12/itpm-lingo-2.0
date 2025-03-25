import { SessionProvider } from "next-auth/react";

export default function AuthLayout({ children }) {
  return (
    <SessionProvider>
      <main>{children}</main>
    </SessionProvider>
  );
}