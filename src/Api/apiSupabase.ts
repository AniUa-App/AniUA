import MainConfig from "../cfgs/MainConfig";
import supabase from "./supabaseClient";

class ServerApiSupabase {
  private static readonly API_KEY = MainConfig.api.key;
  private static uniqueAccountId = MainConfig.devInfo.uniqueAccountId;
  private static cachedDeviceId: string | undefined;

  private static async getUserId(): Promise<string> {
    if (
      this.cachedDeviceId &&
      this.cachedDeviceId !== undefined &&
      this.cachedDeviceId !== "unknown"
    ) {
      return this.cachedDeviceId;
    }
    if (
      MainConfig?.devInfo?.deviceId &&
      MainConfig.devInfo.deviceId !== undefined &&
      MainConfig.devInfo.deviceId !== "unknown"
    ) {
      this.cachedDeviceId = MainConfig.devInfo.deviceId;
      return this.cachedDeviceId;
    }
    if (
      this.cachedDeviceId === undefined ||
      this.cachedDeviceId === "unknown"
    ) {
      MainConfig.devInfo.deviceId = MainConfig.devInfo.getUniqueId();
      console.log(MainConfig.devInfo.deviceId, "getUniqueId");
      this.cachedDeviceId = MainConfig.devInfo.deviceId;
    }
    return this.cachedDeviceId;
  }

  private static async callEdge<T = any>(
    name: string,
    payload: Record<string, any>
  ): Promise<T> {
    const startedAt = Date.now();
    const { data, error } = await supabase.functions.invoke(name, {
      body: payload,
      headers: { Key: this.API_KEY },
    });
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(`⏱️ (supabase) Запит "${name}" зайняв ${seconds} секунд(и)`);
    if (error) {
      console.error(`supabase invoke error for ${name}:`, error);
      throw error;
    }
    return data as T;
  }

  public static async isUser(): Promise<boolean> {
    const userId = await this.getUserId();
    try {
      const data = await this.callEdge<any>("isUser", {
        unique_device_id: userId,
      });
      return !!data?.isUser;
    } catch (error: any) {
      console.error("isUser supabase error:", error);
      return false;
    }
  }

  public static async getUniqueAccountId(): Promise<string> {
    try {
      if (this.uniqueAccountId) return this.uniqueAccountId;
      const userId = await this.getUserId();
      const anyData = await this.callEdge<any>("getAccId", {
        unique_device_id: userId,
      });
      this.uniqueAccountId = anyData?.account_id ?? "";
      return this.uniqueAccountId;
    } catch (error: any) {
      console.error("getAccId supabase error:", error);
      return "";
    }
  }

  public static async newUser(): Promise<string> {
    try {
      const userId = await this.getUserId();
      const anyData = await this.callEdge<any>("newUser", {
        unique_device_id: userId,
      });
      this.uniqueAccountId = anyData?.unique_account_id ?? "";
      return this.uniqueAccountId;
    } catch (error: any) {
      console.error("newUser supabase error:", error);
      return "";
    }
  }
}

const ApiSupabase = new (class ApiS {
  async isUser(): Promise<boolean> {
    return ServerApiSupabase.isUser();
  }
  async getUniqueAccountId(): Promise<string> {
    return ServerApiSupabase.getUniqueAccountId();
  }
  async newUser(): Promise<string> {
    return ServerApiSupabase.newUser();
  }
})();

export default ApiSupabase;
export { ServerApiSupabase };
