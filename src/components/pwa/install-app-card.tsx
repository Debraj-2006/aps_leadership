"use client";

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInstallOffer, getInstallOffer, isInstalled, isIos, subscribeInstallOffer } from "@/lib/pwa";

const noop = () => () => {};

// Install instructions that fit the member's device and browser.
export function InstallAppCard({ children }: { children?: React.ReactNode }) {
  const offer = useSyncExternalStore(subscribeInstallOffer, getInstallOffer, () => null);
  const installed = useSyncExternalStore(noop, isInstalled, () => false);
  const ios = useSyncExternalStore(noop, isIos, () => false);

  async function install() {
    const accepted = await acceptInstallOffer();
    if (accepted) toast.success("Installed. Find the AP-S Hub on your home screen.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone className="size-5" />
        </span>
        <div className="min-w-0 text-sm">
          {installed ? (
            <p className="flex items-center gap-1.5 font-medium text-success">
              <CheckCircle2 className="size-4" /> You&apos;re using the installed app.
            </p>
          ) : offer ? (
            <>
              <p className="font-medium">Add the hub to your home screen</p>
              <p className="text-muted-foreground">It opens full screen like any other app.</p>
              <Button size="sm" className="mt-3" onClick={install}>
                <Download className="size-4" /> Install the hub
              </Button>
            </>
          ) : ios ? (
            <>
              <p className="font-medium">Add the hub to your home screen</p>
              <p className="text-muted-foreground">
                In Safari, tap <Share className="inline size-3.5 align-[-2px]" /> <strong>Share</strong>, then{" "}
                <strong>Add to Home Screen</strong>.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Add the hub to your home screen</p>
              <p className="text-muted-foreground">
                Open this site in Chrome on your phone, then tap the <strong>⋮</strong> menu and choose{" "}
                <strong>Install app</strong> or <strong>Add to Home screen</strong>.
              </p>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
