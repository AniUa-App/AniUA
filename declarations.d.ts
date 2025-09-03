declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

declare module "*.jpeg" {
  const value: any;
  export default value;
}

declare module "*.webp" {
  const value: any;
  export default value;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module "react-native-file-opener" {
  export interface FileOpenerOptions {
    showOpenWithDialog?: boolean;
    showAppsSuggestions?: boolean;
  }

  export default class FileOpener {
    static open(filePath: string, options?: FileOpenerOptions): Promise<void>;
  }
}

declare module "react-native-system-navigation-bar" {
  export default class SystemNavigationBar {
    static navigationHide(): Promise<void>;
    static navigationShow(): Promise<void>;
    static setNavigationColor(
      color: string,
      style: string,
      type: string
    ): Promise<void>;
    static setBarMode(mode: string, type: string): Promise<void>;
  }
}

declare global {
  var __DEV__: boolean;
}
