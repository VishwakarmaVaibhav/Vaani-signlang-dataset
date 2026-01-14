import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import DatasetShowcase from "./components/DataShowcase";
import supabase from "./lib/supabaseClient";

// Helper to disable caching so you always see new images
export const revalidate = 0;

export default async function Home() {
  // 1. Fetch latest 100 images from Supabase
  const { data, error } = await supabase
    .from('gesture_images')
    .select('image_url')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching images:", error);
  }

  // 2. Format the data to match what the component expects
  // The DB returns { image_url: "..." }, component wants { imageUrl: "..." }
  const realCaptures = data?.map((item) => ({
    imageUrl: item.image_url
  })) || [];

  return (
    <main className="min-h-screen">
      
      <Hero />
      
      {/* 3. Pass the real data here */}
      <DatasetShowcase captures={realCaptures} />
      
      <AboutSection />
    </main>
  );
}