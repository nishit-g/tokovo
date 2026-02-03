import { DeviceShell } from "./types";

export class DeviceShellRegistryClass {
  private shells = new Map<string, DeviceShell>();

  register(shell: DeviceShell) {
    this.shells.set(shell.id, shell);
  }

  get(id: string): DeviceShell | undefined {
    return this.shells.get(id);
  }

  has(id: string): boolean {
    return this.shells.has(id);
  }

  list(): string[] {
    return Array.from(this.shells.keys());
  }

  clear(): void {
    this.shells.clear();
  }
}

export function createDeviceShellRegistry(): DeviceShellRegistryClass {
  return new DeviceShellRegistryClass();
}
