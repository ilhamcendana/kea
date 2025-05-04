import { eventsTable } from "@/helpers/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { useState } from "react";

const useFetchEvents = () => {
  const [isLoading, setIsLoading] = useState(false);

  function listAllEvents() {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      let { data, error } = await supabase.from(eventsTable).select("*");

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
  return { listAllEvents, isLoading };
};

export default useFetchEvents;
