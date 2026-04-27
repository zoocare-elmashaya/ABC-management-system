import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import ClientAuthReset from './client-auth-reset'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: "Zoo Care (ABC)",
  manifest: "/manifest.json",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col items-center bg-neutralhigh">
        <ClientAuthReset>
          <Header />
          {children}
        </ClientAuthReset>
      </body>
    </html>
  );
}
