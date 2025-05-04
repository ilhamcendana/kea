// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/supabase";
import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  session?: AuthTokenResponsePassword["data"]["session"];
  user?: AuthTokenResponsePassword["data"]["user"];
  error?: {
    message: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    return res.json({ error: { message: "GET method not allowed" } });
  }
  if (req.method === "POST") {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: req?.body?.email,
      password: req?.body?.password,
    });
    if (error) {
      console.error("Login error", error);
      return res.status(401).json({
        error: {
          message: error.message,
        },
      });
    }
    return res.status(200).json({
      session: data?.session,
      user: data?.user,
    });
  }
}
