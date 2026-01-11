// app/api/uploadImage/route.js
import { supabase } from "../../lib/supabaseClient";

export async function POST(req) {
  try {
    const { image, userId, letter } = await req.json();
    const fileName = `${userId}/${letter}_${Date.now()}.png`;

    // Strip the base64 prefix (e.g., data:image/png;base64,)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const { data, error } = await supabase.storage
      .from("gestures")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    return Response.json({ success: true, path: data.path });
  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}