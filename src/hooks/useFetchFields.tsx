import { formFieldsTable } from "@/helpers/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase";
import { useState } from "react";

const useFetchFields = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { event } = useAuthStore();

  function listAllFields() {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      let { data, error } = await supabase
        .from(formFieldsTable)
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

  function updateField(payload: any,id: string) {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from(formFieldsTable)
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

  function deleteField(id: string) {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);

      const { error } = await supabase
      .from(formFieldsTable)
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
  return { listAllFields, isLoading, updateField,deleteField };
};

export default useFetchFields;
