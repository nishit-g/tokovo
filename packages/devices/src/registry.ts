import { DeviceShell } from "./types";

class DeviceRegistryClass {
    private shells = new Map<string, DeviceShell>();

    register(shell: DeviceShell) {
        this.shells.set(shell.id, shell);
    }

    get(id: string): DeviceShell | undefined {
        return this.shells.get(id);
    }
}

export const DeviceRegistry = new DeviceRegistryClass();
