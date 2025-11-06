import { useEffect, useState } from "react";
import QRCode from "qrcode";
import sodium from "libsodium-wrappers";
import { ensureIdentity } from "../crypto/keys";

export default function VerifyDevicePage({ peerUserId, peerBundle }) {
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    (async () => {
      await sodium.ready;
      const me = await ensureIdentity();
      // safety: hash of (my ed25519 pk || their ed25519 pk)
      const bytes = new TextEncoder().encode(`${me.ed25519.pk}|${peerBundle.identitySigningEd25519}`);
      const h = sodium.to_hex(sodium.crypto_generichash(16, bytes)).toUpperCase();
      const groups = h.match(/.{1,4}/g).join(" ");
      setCode(groups);
      setQr(await QRCode.toDataURL(h));
    })();
  }, [peerBundle]);

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Verify Safety Code</h2>
      <p className="text-sm opacity-70">Compare this code with your contact. It should match exactly.</p>
      <div className="p-4 rounded-xl bg-base-200 text-center font-mono tracking-widest text-lg">{code}</div>
      {qr && <img src={qr} alt="safety qr" className="mx-auto w-48 h-48" />}
    </div>
  );
}
