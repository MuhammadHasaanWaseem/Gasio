import { supabase } from "@/lib/supabase";

/**
 * Increment total_orders count in order_stats for the given vendor.
 * Creates a new order_stats row if not exists.
 * @param vendorId UUID of the vendor
 */
export async function updateOrderStatsOnBooking(vendorId: string) {
  try {
    // Fetch current stats
    const { data: statsData, error: statsError } = await supabase
      .from("order_stats")
      .select("*")
      .eq("vendor_id", vendorId)
      .single();

    if (statsError && statsError.code !== "PGRST116") { // PGRST116 = no rows found
      throw statsError;
    }

    let stats = statsData || {
      vendor_id: vendorId,
      total_orders: 0,
      successful_orders: 0,
      failed_orders: 0,
      cancelled_orders: 0,
      total_earned: 0,
    };

    // Increment total_orders count
    stats.total_orders = (stats.total_orders || 0) + 1;

    // Upsert the updated stats
    const { error: upsertError } = await supabase
      .from("order_stats")
      .upsert(stats, { onConflict: "vendor_id" });

    if (upsertError) throw upsertError;
  } catch (error) {
    console.error("Error updating order stats on booking:", error);
  }
}
