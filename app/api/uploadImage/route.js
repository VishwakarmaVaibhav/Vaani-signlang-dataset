import { supabase } from "../../lib/supabaseClient";

export async function POST(req) {
  try {
    const { image, userId, letter } = await req.json();
    const fileName = `${userId}/${letter}_${Date.now()}.png`;

    // Strip the base64 prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 1. Upload to Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("gestures")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) throw storageError;

    // 2. Get the Public URL
    const { data: urlData } = supabase.storage
      .from("gestures")
      .getPublicUrl(fileName);
    
    // 3. Insert into the DATABASE TABLE (gesture_images)
    const { error: dbError } = await supabase
      .from("gesture_images")
      .insert([{
        user_id: userId, // Ensure this is the UUID from users table
        letter: letter,
        image_url: urlData.publicUrl
      }]);
    
    if (dbError) throw dbError;
    
    return Response.json({ 
      success: true, 
      path: storageData.path, 
      publicUrl: urlData.publicUrl 
    });

  } catch (err) {
    console.error("Upload/DB Sync Error:", err.message);
    return Response.json({ success: false, error: err.message });
  }
}