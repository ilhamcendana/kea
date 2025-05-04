import { participantsTable } from "@/helpers/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { useState } from "react";

const useFetchParticipant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { event } = useAuthStore();

  function listAllParticipant() {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      let { data, error } = await supabase
        .from(participantsTable)
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

  function updateParticipant(payload: any,id: string) {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from(participantsTable)
        .update(payload)
        .eq("id", id)
        .select()

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

  function deleteParticipant(id: string) {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);

      const { error } = await supabase
      .from(participantsTable)
      .delete()
      .eq('id', id)

      setIsLoading(false);
      // Handle error
      if (error) {
        reject(error);
        return;
      }
      resolve(true);
      return;
    })
  }
  return { listAllParticipant, isLoading, updateParticipant,deleteParticipant };
};

export default useFetchParticipant;
