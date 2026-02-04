import { NextResponse } from 'next/server';
import supabase from '../../../lib/supabaseClient';

export const revalidate = 0; // Disable caching for stats

export async function GET() {
    try {
        // Ideally we would use an RPC for "select letter, count(*) group by letter"
        // But since we can't create SQL functions easily from here, we'll fetch the 'letter' column
        // This is efficient enough for datasets up to ~50k rows.

        // We fetch ALL rows, but only the specific column.
        const { data, error } = await supabase
            .from('gesture_images')
            .select('letter');

        if (error) throw error;

        // Aggregation in JS (Server-Side)
        const counts = {};
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

        // Initialize with 0
        alphabet.forEach(char => counts[char] = 0);

        // Count
        data.forEach(row => {
            const char = row.letter ? row.letter.toUpperCase() : null;
            if (counts[char] !== undefined) {
                counts[char]++;
            }
        });

        return NextResponse.json({ success: true, counts });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
