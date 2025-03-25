import { SessionProvider } from "next-auth/react";
import Footer from "../components/Footer";


export default function MainLayout({ children }) {
  return (
    <SessionProvider>
      <main>{children}</main>
      <Footer />
    </SessionProvider>
  );
}