export interface Instance {
  InstanceID: string;
  InstanceName: string;
  FriendlyName: string;
  ModuleDisplayName: string;
  Running: boolean;
  AppState: AppState;
  Metrics: Metrics;
  ApplicationEndpoints: ApplicationEndpoint[];
}

export interface Metrics {
  "CPU Usage": {
    RawValue: number;
    MaxValue: number;
    Percent: number;
    Units: string;
  };
  "Memory Usage": {
    RawValue: number;
    MaxValue: number;
    Percent: number;
    Units: string;
  };
  "Active Users": {
    RawValue: number;
    MaxValue: number;
    Percent: number;
    Units: string;
  };
}

export interface ApplicationEndpoint {
  DisplayName: string;
  Endpoint: string;
  Uri: string;
}

//https://github.com/p0t4t0sandwich/ampapi-py/blob/main/ampapi/types.py#L225
export enum AppState {
  Undefined = -1,
  Stopped = 0,
  PreStart = 5,
  Configuring = 7, //The server is performing some first-time-start configuration.
  Starting = 10,
  Ready = 20,
  Restarting = 30, //Server is in the middle of stopping, but once shutdown has finished it will automatically restart.
  Stopping = 40,
  PreparingForSleep = 45,
  Sleeping = 50, //The application should be able to be resumed quickly if using this state. Otherwise use Stopped.
  Waiting = 60, //The application is waiting for some external service/application to respond/become available.
  Installing = 70,
  Updating = 75,
  AwaitingUserInput = 80, //Used during installation, means that some user input is required to complete setup (authentication etc).
  Failed = 100,
  Suspended = 200,
  Maintenance = 250,
  Indeterminate = 999, //The state is unknown, or doesn't apply (for modules that don't start an external process)
}

// Instance.ModuleDisplayName
export const SettingsReference: Record<string, ServerSettings> = {
  Palworld: {
    Settings: ["Palworld Gameplay Settings", "Palworld Multiplier Settings"],
    Connection: {
      Settings: "Palworld:stadia_controller",
      ServerName: "Server Name",
      ServerDescription: "Server Description",
      Password: "Server Password",
    },
  },
  Enshrouded: {
    Connection: {
      Settings: "Enshrouded Server Settings",
      ServerName: "Server Name",
      ServerDescription: "Server Description",
      Password: "Server Password",
    },
  },
  "Sons Of The Forest": {
    Settings: ["SotF - Game Settings"],
    Connection: {
      Settings: "SotF - Server Settings",
      ServerName: "Server Name",
      Password: "Password",
    },
  },
  "Skyrim Together Reborn": {
    Settings: ["STR Settings"],
  },
  "V Rising": {
    Settings: ["V Rising - Game Settings"],
    Connection: {
      Settings: "V Rising - Host Settings",
      ServerName: "Server Name",
      ServerDescription: "Description",
      Password: "Password",
    },
  },
  "ARK: Survival Ascended": {
    Settings: [
      "ARK Gameplay Settings",
      "ARK Multiplier Settings",
      "ARK Structure Settings",
    ],
    Connection: {
      Settings: "ARK Server Settings",
      ServerName: "Server Name",
      ServerDescription: "MOTD",
      Password: "Server Password",
    },
  },
};

interface ServerSettings {
  // Array of settings to pull data from
  Settings?: string[];
  // Settings to pull connection data from (should not be listed in Settings array)
  Connection?: {
    Settings: string;
    ServerName: string;
    ServerDescription?: string;
    Password: string;
  };
}

export interface ServerUpdate {
  Title: string;
  Status: {
    State: AppState;
    Uptime: string;
    Metrics: Metrics;
  };
}
