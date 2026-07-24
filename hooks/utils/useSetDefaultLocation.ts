import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export const useSetDefaultLocation = () => {
  const queryClient = useQueryClient();

  const setDefaultLocation = async (
    locationId: string,
    householdId: string,
  ) => {
    await supabase
      .from("locations")
      .update({ is_default: false })
      .eq("household_id", householdId);

    const { error } = await supabase
      .from("locations")
      .update({ is_default: true })
      .eq("id", locationId);

    if (error) {
      console.error("Error setting default location:", error);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  return { setDefaultLocation };
};
