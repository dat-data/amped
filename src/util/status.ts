import { AppState } from "../types/instance.js";

export function getStatusIcon(appState: AppState): string {
  switch (appState) {
    case AppState.Ready:
      return "▶️";
    case AppState.Configuring:
    case AppState.PreStart:
    case AppState.Starting:
    case AppState.Waiting:
    case AppState.Installing:
      return "...▶️";
    case AppState.Stopped:
    case AppState.Sleeping:
    case AppState.Suspended:
      return "🛑";
    case AppState.Stopping:
    case AppState.PreparingForSleep:
      return "🛑...";
    case AppState.Undefined:
    case AppState.AwaitingUserInput:
    case AppState.Indeterminate:
      return "❔";
    case AppState.Updating:
    case AppState.Maintenance:
      return "⏫";
    case AppState.Restarting:
      return "🔄";
    case AppState.Failed:
      return "❌";
    default:
      return "❔";
  }
}
