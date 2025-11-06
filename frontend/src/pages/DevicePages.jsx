import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { publishDeviceBundle } from "../crypto/x3dh";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);

  async function refresh() {
    const { data: me } = await axiosInstance.get("/auth/check");
    const { data } = await axiosInstance.get(`/devices/bundles/${me._id}`);
    setDevices(data);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Devices</h2>
        <button className="btn btn-primary btn-sm" onClick={async () => { await publishDeviceBundle(); await refresh(); }}>
          Add This Device
        </button>
      </div>
      <div className="space-y-2">
        {devices.map(d => (
          <div key={d.deviceId} className="p-3 rounded-lg border flex items-center justify-between">
            <div>
              <div className="font-mono text-sm">{d.deviceId}</div>
              <div className="text-xs opacity-70">prekeys: {d.oneTimePrekeys?.length ?? 0}</div>
            </div>
            {/* revoke API could set revokedAt */}
            {/* <button className="btn btn-error btn-xs">Revoke</button> */}
          </div>
        ))}
      </div>
    </div>
  );
}
