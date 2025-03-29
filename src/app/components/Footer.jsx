import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Footer() {
  return (
    <footer className="bg-background border-t mt-auto py-6 sm:py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <p className="text-muted-foreground text-xs sm:text-sm text-center mb-3 sm:mb-4 leading-relaxed">
          Conceptualized in{" "}
          <Link
            href="https://www.usegalileo.ai/explore"  
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "px-0 text-foreground hover:text-primary font-semibold text-xs sm:text-sm"
            )}
          >
            Galelio AI
          </Link>{" "}
          and built using{" "}
          <Link
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "px-0 text-foreground hover:text-primary font-semibold text-xs sm:text-sm"
            )}
          >
            Next.js
          </Link>
          ,{" "}
          <Link
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "px-0 text-foreground hover:text-primary font-semibold text-xs sm:text-sm"
            )}
          >
            shadcn UI
          </Link>
          , and{" "}
          <Link
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "px-0 text-foreground hover:text-primary font-semibold text-xs sm:text-sm"
            )}
          >
            Tailwind CSS
          </Link>
          , this project was final project for the ITPM module.
        </p>

        <p className="text-muted-foreground text-[0.7rem] xs:text-xs text-center">
          © 2025 ITPM-LINGO All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;