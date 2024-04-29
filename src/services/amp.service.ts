import { got } from "got";
import { Instance } from "src/types/instance.js";

export class AmpService {
  private sessionId: string = "";
  private baseUrl: string;
  constructor() {
    this.baseUrl = `${process.env.AMP_URL}:${process.env.AMP_PORT}`;
    this.getSession();
  }

  private async getSession() {
    const res: any = await got
      .post(`${this.baseUrl}/API/Core/Login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        json: {
          username: process.env.AMP_USERNAME,
          password: process.env.AMP_PASSWORD,
          token: "",
          rememberMe: false,
        },
      })
      .json();

    this.sessionId = res.sessionID;
  }

  async getInstances(): Promise<Instance[]> {
    const res: any = await got
      .post(`${this.baseUrl}/API/ADSModule/GetInstances`, {
        headers: {
          Accept: "application/json",
        },
        json: {
          SESSIONID: this.sessionId,
        },
      })
      .json();

    return res[0].AvailableInstances.filter(
      (instance: any) => instance.Module !== "ADS"
    );
  }

  async getInstance(instanceId: string): Promise<Instance> {
    return {} as Instance;
  }

  async startInstance(instanceId: string): Promise<void> {}
}
