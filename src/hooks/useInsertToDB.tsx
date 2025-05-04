import { supabase } from "@/supabase";
import { useState } from "react";

const useInsertToDB = () => {
  const [isLoading, setIsLoading] = useState(false);

  function mutate({ tableName, payload }: { tableName: string; payload: any }) {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select();
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

  return { mutate, isLoading };
};

export default useInsertToDB;
