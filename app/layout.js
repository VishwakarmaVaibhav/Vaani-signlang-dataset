import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";

// app/layout.js
export const metadata = {
  metadataBase: new URL('https://vaani.gemini.co'), // Replace with actual domain
  title: {
    default: "Vaani | Speak with AI",
    template: "%s | Vaani"
  },
  description: "Vaani is India's largest research project for Sign Language recognition. Join Vaibhav Vishwakarma in building a more accessible future.",
  keywords: ["Vaani", "Sign Language", "AI Research India", "Vaibhav Vishwakarma", "Accessibility Tech", "Indian Sign Language", "ISL", "Machine Learning"],
  authors: [{ name: "Vaibhav Vishwakarma", url: "https://www.linkedin.com/in/vishwakarmavaibhav/" }],
  creator: "Vaibhav Vishwakarma",
  openGraph: {
    title: "Vaani Research Project",
    description: "Help us teach machines to sign. Join the largest sign language dataset initiative.",
    url: "https://vaani.gemini.co",
    siteName: "Vaani",
    images: [
      {
        url: "/vaani.png",
        width: 1200,
        height: 630,
        alt: "Vaani Project Banner"
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vaani | Speak with AI',
    description: 'Help us teach machines to sign.',
    creator: '@vishwakarma_vaibhav', // Add real handle if applicable
    images: ['/vaani.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // User needs to add this
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  "name": "Vaani",
  "url": "https://vaani.gemini.co",
  "logo": "https://vaani.gemini.co/vaani.png",
  "description": "India's largest research project for Sign Language recognition.",
  "founder": {
    "@type": "Person",
    "name": "Vaibhav Vishwakarma"
  },
  "areaServed": "IN"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* STRUCTURAL DATA FOR SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <SmoothScroll />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
