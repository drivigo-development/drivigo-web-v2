import React, { useState, useEffect } from "react";
import { base64urlToUint8Array } from "../utils/base64urlToUint8Array";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { BellRing, BellOff } from "lucide-react";

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();

export default function EnableNotificationsSupabase() {
  const [status, setStatus] = useState("idle"); // idle | working | ready | error
  const { user } = useAuth();

  // Decide bell state by checking: user.id + SW subscription (endpoint+p256dh) exists in DB
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log("[INIT] user:", user?.id);

        if (!user?.id) {
          console.log("[INIT] No user -> idle");
          if (!cancelled) setStatus("idle");
          return;
        }

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          console.warn("[INIT] SW/Push not supported -> idle");
          if (!cancelled) setStatus("idle");
          return;
        }

        // Ensure we have a registration first (important on first load)
        let reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          console.log("[INIT] No SW registration, registering /sw.js …");
          reg = await navigator.serviceWorker.register("/sw.js");
        } else {
          console.log("[INIT] Found existing SW registration.");
        }

        const sub = await reg.pushManager.getSubscription();
        console.log("[INIT] Current push subscription:", sub);

        if (!sub) {
          console.log("[INIT] No browser subscription -> idle");
          if (!cancelled) setStatus("idle");
          return;
        }

        const subJson = sub.toJSON();
        const endpoint = sub.endpoint;
        const p256dh = subJson?.keys?.p256dh;

        console.log("[INIT] endpoint:", endpoint);
        console.log("[INIT] p256dh:", p256dh);

        if (!endpoint || !p256dh) {
          console.log("[INIT] Missing endpoint or p256dh -> idle");
          if (!cancelled) setStatus("idle");
          return;
        }

        // Exact match in DB: user_id + endpoint + p256dh
        const { data, error } = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .eq("endpoint", endpoint)
          .eq("p256dh", p256dh)
          .limit(1);

        if (error) {
          console.warn("[INIT] Supabase check error:", error);
          if (!cancelled) setStatus("idle");
          return;
        }

        const exists = Array.isArray(data) && data.length > 0;
        console.log("[INIT] DB exact-match exists?", exists);

        if (!cancelled) setStatus(exists ? "ready" : "idle");
      } catch (e) {
        console.error("[INIT] Initial subscription state check failed:", e);
        if (!cancelled) setStatus("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleNotifications = async () => {
    try {
      console.log("[TOGGLE] Current status:", status);
      setStatus("working");

      if (!user?.id) throw new Error("Please log in first.");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push is not supported in this browser.");
      }
      if (!PUBLIC_KEY) throw new Error("Missing VAPID public key (.env).");

      const reg =
        (await navigator.serviceWorker.getRegistration()) ??
        (await navigator.serviceWorker.register("/sw.js"));

      const sub = await reg.pushManager.getSubscription();
      console.log("[TOGGLE] Existing subscription:", sub);

      if (status === "ready" && sub) {
        // 🔴 Disable (unchanged)
        const endpoint = sub.endpoint;
        console.log("[TOGGLE] Disabling… endpoint:", endpoint);

        await sub.unsubscribe();
        console.log("[TOGGLE] Unsubscribed from browser push");

        if (endpoint) {
          const { error } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", endpoint);

          if (error) {
            console.error("[TOGGLE] Supabase delete error:", error);
            throw error;
          }
          console.log("[TOGGLE] Deleted row for user+endpoint in DB");
        }

        setStatus("idle");
      } else {
        // 🟢 Enable (unchanged)
        console.log("[TOGGLE] Enabling… requesting Notification permission");
        const permission = await Notification.requestPermission();
        console.log("[TOGGLE] Permission:", permission);
        if (permission !== "granted")
          throw new Error("Notifications are blocked.");

        const newSub =
          sub ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64urlToUint8Array(PUBLIC_KEY),
          }));

        console.log("[TOGGLE] Active subscription:", newSub);

        const payload = {
          user_id: user.id,
          endpoint: newSub.endpoint,
          p256dh: newSub.toJSON().keys.p256dh,
          auth: newSub.toJSON().keys.auth,
          user_agent: navigator.userAgent,
        };

        console.log("[TOGGLE] Upserting payload:", payload);

        const { error } = await supabase
          .from("push_subscriptions")
          .upsert(payload, { onConflict: "endpoint" });

        if (error) {
          console.error("[TOGGLE] Supabase upsert error:", error);
          throw error;
        }

        console.log("[TOGGLE] Upsert OK. Setting ready.");
        setStatus("ready");
      }
    } catch (e) {
      console.error("[TOGGLE] Notification toggle error:", e);
      setStatus("error");
      alert(e.message || "Failed to toggle notifications");
    }
  };

  return (
    <button
      onClick={toggleNotifications}
      disabled={status === "working"}
      className={`flex items-center gap-2 px-2 py-2 text-primary rounded transition ${
        status === "ready" ? "hover:bg-green-700/50" : "hover:bg-red-700/50"
      } disabled:opacity-50`}
      aria-label={status === "ready" ? "Disable notifications" : "Enable notifications"}
      title={status === "ready" ? "Disable notifications" : "Enable notifications"}
    >
      {status === "ready" ? <BellRing size={18} /> : <BellOff size={18} />}
    </button>
  );
}
