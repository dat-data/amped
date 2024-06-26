import { got } from "got";
import { Instance, ServerUpdate } from "../types/instance";

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

  private async getServerSession(serverId: string): Promise<string> {
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/Login`,
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

  async getServerSettings(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/GetSettingsSpec`,
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

  async getServerUpdate(instanceId: string): Promise<ServerUpdate> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/GetUpdates`,
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

  async startInstance(instanceName: string): Promise<void> {
    const sessionId = await this.getSession();
    const res: any = await got
      .post(`${this.baseUrl}/API/ADSModule/StartInstance`, {
        headers: {
          Accept: "application/json",
        },
        json: {
          SESSIONID: sessionId,
          InstanceName: instanceName,
        },
      })
      .json();

    return res;
  }

  async startServer(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/Start`,
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

  async stopServer(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(`${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/Stop`, {
        headers: {
          Accept: "application/json",
        },
        json: {
          SESSIONID: sessionId,
        },
      })
      .json();

    return res;
  }

  async restartServer(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/Restart`,
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

  async updateServer(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/Core/UpdateApplication`,
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

  async backupServer(instanceId: string): Promise<any> {
    const serverId = this.getServerId(instanceId);
    const sessionId = await this.getServerSession(serverId);
    const res: any = await got
      .post(
        `${this.baseUrl}/API/ADSModule/Servers/${serverId}/API/LocalFileBackupPlugin/TakeBackup`,
        {
          headers: {
            Accept: "application/json",
          },
          json: {
            SESSIONID: sessionId,
            Title: `Backup ${Math.floor(new Date().getTime() / 1000)}`,
            Description: `Backup taken by Discord bot`,
            Sticky: false,
          },
        }
      )
      .json();

    return res;
  }

  private getServerId(instanceId: string): string {
    return instanceId.split("-")[0];
  }
}
