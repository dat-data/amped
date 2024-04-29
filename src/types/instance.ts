export interface Instance {
  InstanceID: string;
  InstanceName: string;
  FriendlyName: string;
  Running: boolean;
  AppState: AppState;
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
