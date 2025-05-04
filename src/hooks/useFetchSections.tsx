import { landingPageTable } from "@/helpers/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { useState } from "react";

const useFetchSections = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { event } = useAuthStore();

  function listAllSections() {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      let { data, error } = await supabase
        .from(landingPageTable)
        .select("*")
        .eq("eventID", event?.id);

      setIsLoading(false);
      // Handle error
      if (error) {
        reject(error);
        return;
      }
      // Handle success
      if (data) {
        resolve(data);
        return;
      }
    });
  }

  return { isLoading, listAllSections };
};

export default useFetchSections;
