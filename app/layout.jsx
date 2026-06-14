import "./globals.css";

export const metadata = {
  title: "Bellal Brothers Project Calculation",
  description: "Frontend-only project calculation and access-control demo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
