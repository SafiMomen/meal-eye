import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { DietaryPreferencesProvider } from "@/components/dietary/preferences-provider";
import { FitnessProvider } from "@/components/fitness/fitness-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meal Eye | Princeton Dining",
  description: "Browse Princeton dining hall menus by meal period.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <MotionProvider>
          <DietaryPreferencesProvider>
            <FitnessProvider>{children}</FitnessProvider>
          </DietaryPreferencesProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
