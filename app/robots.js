export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin',
        },
        sitemap: 'https://vaani.gemini.co/sitemap.xml', // Replace with real domain if available
    }
}
