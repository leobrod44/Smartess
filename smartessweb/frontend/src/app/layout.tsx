import localFont from "next/font/local";
import "@/public/styles/globals.css";
import { ReactNode } from "react";
import { UserProvider } from "@/context/UserProvider";

export const metadata = {
  title: "Smartess",
  description: "Smart living at scale",
  keywords: "",
};

// Define each font style separately
const sequelSansMediumBody = localFont({
  src: "../public/fonts/Sequel-Sans-Medium-Body.ttf",
  weight: "500",
  variable: "--font-sequel-sans-medium",
});

const sequelSansBold = localFont({
  src: "../public/fonts/Sequel-Sans-Medium-Body.ttf",
  weight: "700",
  variable: "--font-sequel-sans-bold",
});

const sequelSansRomanBody = localFont({
  src: "../public/fonts/Sequel-Sans-Roman-Body.ttf",
  weight: "400",
  variable: "--font-sequel-sans-roman",
});

const sequelSansLightDisp = localFont({
  src: "../public/fonts/Sequel-Sans-Light-Disp.ttf",
  weight: "300",
  variable: "--font-sequel-sans-light-disp",
});

const sequelSansLightBody = localFont({
  src: "../public/fonts/Sequel-Sans-Light-Body.ttf",
  weight: "300",
  variable: "--font-sequel-sans-light-body",
});

const sequelSansBlackDisp = localFont({
  src: "../public/fonts/Sequel-Sans-Black-Disp.ttf",
  weight: "900",
  variable: "--font-sequel-sans-black-disp",
});

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <html
      lang="en"
      className="h-full bg-white"
    >
      <body
        className={`${sequelSansMediumBody.variable} ${sequelSansBold.variable} ${sequelSansRomanBody.variable} ${sequelSansLightDisp.variable} ${sequelSansLightBody.variable} ${sequelSansBlackDisp.variable}`}
      >
        <UserProvider>
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}