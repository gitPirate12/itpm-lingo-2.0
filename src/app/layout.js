import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const inter = Inter({
  variable: "--font-inter-sans",  
  subsets: ["latin"],
});

export const metadata = {
  title: "ITPM-Lingo",
  description:
    "An English-to-Sinhala language learning community platform developed as part of the third-year ITPM project.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <main>{children}</main>
        
        <Footer />
        </body>
    </html>
  );
}
