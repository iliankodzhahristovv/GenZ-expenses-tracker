import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all categories for this user
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("group_name")
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by group_name
    const grouped: Record<string, Array<{ id: string; icon: string; name: string }>> = {};
    
    categories?.forEach((cat) => {
      if (!grouped[cat.group_name]) {
        grouped[cat.group_name] = [];
      }
      grouped[cat.group_name].push({
        id: cat.id,
        icon: cat.icon,
        name: cat.name,
      });
    });

    return NextResponse.json(grouped, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

