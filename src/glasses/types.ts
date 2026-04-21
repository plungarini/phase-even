export interface HudTextDescriptor {
  containerID: number;
  containerName: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  paddingLength?: number;
  borderWidth?: number;
  borderRadius?: number;
  borderColor?: number;
  isEventCapture?: number;
}

export interface HudLayoutDescriptor {
  key: string;
  textDescriptors: HudTextDescriptor[];
}

export interface HudRenderState {
  layout: HudLayoutDescriptor;
  textContents: Record<string, string>;
}
