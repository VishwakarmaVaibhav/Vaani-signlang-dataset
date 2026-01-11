// app/api/submitUser/route.js
import supabase from "../../lib/supabaseClient"; // Remove the { }

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Incoming Request Body:", body);

    // Now 'supabase' will be recognized correctly as the client
    const { data, error } = await supabase
      .from("users")
      .insert([
        { 
          name: body.name, 
          email: body.email, 
          age: body.age, 
          consent: body.consent 
        }
      ])
      .select();

    if (error) {
      console.error("Supabase Database Error:", error.message);
      return Response.json({ success: false, error: error.message });
    }

    return Response.json({ success: true, user: data[0] });

  } catch (err) {
    // This is where your previous error was caught
    console.error("Server API Error Details:", err); 
    return Response.json({ success: false, error: err.message });
  }
}