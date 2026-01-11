import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// app/layout.js
export const metadata = {
  title: {
    default: "Vaani | Speak with AI",
    template: "%s | Vaani" // This allows sub-pages to have titles like "Upload | Vaani"
  },
  description: "Vaani is India's largest research project for Sign Language recognition. Join Vaibhav Vishwakarma in building a more accessible future.",
  keywords: ["Vaani", "Sign Language", "AI Research India", "Vaibhav Vishwakarma", "Accessibility Tech"],
  authors: [{ name: "Vaibhav Vishwakarma" }],
  openGraph: {
    title: "Vaani Research Project",
    description: "Help us teach machines to sign.",
    url: "https://your-domain.com",
    siteName: "Vaani",
    images: [
      {
        url: "/vaani.png", // Image shown when sharing link on WhatsApp/LinkedIn
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* THEME FIX - MUST BE IN <head> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme') || 'system';
                  if (saved === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else if (saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `
          }}
        />
      </head>

      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
