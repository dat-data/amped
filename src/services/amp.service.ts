import { got } from "got";
import { Instance } from "src/types/instance.js";

export class AmpService {
  private baseUrl: string;
  constructor() {
    this.baseUrl = `${process.env.AMP_URL}:${process.env.AMP_PORT}`;
    this.getSession();
  }

  private async getSession(): Promise<string> {
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

    return res.sessionID;
  }

  // This method uses a shortened instanceId
  private async getInstanceSession(instanceId: string): Promise<string> {
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${instanceId}/API/Core/Login`,
        {
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
        }
      )
      .json();

    return res.sessionID;
  }

  async getInstances(): Promise<Instance[]> {
    const sessionId = await this.getSession();
    const res: any = await got
      .post(`${this.baseUrl}/API/ADSModule/GetInstances`, {
        headers: {
          Accept: "application/json",
        },
        json: {
          SESSIONID: sessionId,
        },
      })
      .json();

    return res[0].AvailableInstances.filter(
      (instance: any) => instance.Module !== "ADS"
    );
  }

  async getInstance(instanceId: string): Promise<Instance> {
    const sessionId = await this.getSession();
    const res: any = await got
      .post(`${this.baseUrl}/API/ADSModule/GetInstance`, {
        headers: {
          Accept: "application/json",
        },
        json: {
          SESSIONID: sessionId,
          InstanceId: instanceId,
        },
      })
      .json();

    return res;
  }

  async getInstanceSettings(instanceId: string): Promise<any> {
    const shortId = this.getInstanceShortId(instanceId);
    const sessionId = await this.getInstanceSession(shortId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${shortId}/API/Core/GetSettingsSpec`,
        {
          headers: {
            Accept: "application/json",
          },
          json: {
            SESSIONID: sessionId,
          },
        }
      )
      .json();

    return res;
  }

  async startInstance(instanceId: string): Promise<void> {}

  private getInstanceShortId(instanceId: string): string {
    return instanceId.split("-")[0];
  }
}
