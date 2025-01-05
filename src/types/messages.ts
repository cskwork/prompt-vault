export interface TogglePinMessage {
  type: 'TOGGLE_PIN';
}

export interface TogglePinResponse {
  success: boolean;
  error?: string;
}

export type ExtensionMessage = TogglePinMessage;
export type ExtensionResponse = TogglePinResponse;
