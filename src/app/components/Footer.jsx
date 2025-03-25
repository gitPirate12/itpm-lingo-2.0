import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Footer() {
  return (
    <footer className="bg-background border-t mt-auto py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <p className="text-muted-foreground text-sm text-center mb-4">
          Conceptualized in{" "}
          <Link
            href="https://www.usegalileo.ai/explore"  
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "link" }),
              "px-0 text-foreground hover:text-primary font-semibold"
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
              "px-0 text-foreground hover:text-primary font-semibold"
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
              "px-0 text-foreground hover:text-primary font-semibold"
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
              "px-0 text-foreground hover:text-primary font-semibold"
            )}
          >
            Tailwind CSS
          </Link>
          , this project was final project for the ITPM module.
        </p>

        <p className="text-muted-foreground text-xs text-center">
          © 2025 ITPM-LINGO All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;