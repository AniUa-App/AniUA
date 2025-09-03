import { createClient } from "@supabase/supabase-js";
import MainConfig from "../cfgs/MainConfig";

const rawUrl = MainConfig.api.url;
const supabaseAnonKey = MainConfig.api.key;
// База без "/v1" у хвості, щоб уникнути дублювання шляху
const baseUrl = rawUrl.replace(/\/v1\/?$/, "");

const customFetch: typeof fetch = (input: any, init?: any) => {
  try {
    const url =
      typeof input === "string" ? input : String((input as any)?.url ?? input);
    if (url.includes("/functions/v1/")) {
      const newUrl = url.replace("/functions/v1/", "/v1/");
      return fetch(newUrl as any, init as any);
    }
  } catch (_e) {}
  return fetch(input as any, init as any);
};

export const supabase = createClient(baseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: customFetch,
  },
});

export default supabase;
