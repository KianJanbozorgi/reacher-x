import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import localFont from "next/font/local";

export const vazirmatn = localFont({
  src: "./assets/fonts/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
  style: "normal",
});

export const geistMono = GeistMono;
export const geistPixelSquare = GeistPixelSquare;
