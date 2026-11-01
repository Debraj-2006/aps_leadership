"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPoll } from "@/lib/actions/voting";

const MAX_OPTIONS = 10;

export function NewPollDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [pending, startTransition] = useTransition();

  function reset() {
    setOptions(["", ""]);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPoll(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Poll created. Members have been notified.");
        setOpen(false);
        reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" /> New poll
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New poll</DialogTitle>
          <DialogDescription>
            Every member can vote once. Votes are anonymous, and members see results after they vote or when the poll closes.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poll-title">Question</Label>
            <Input id="poll-title" name="title" required minLength={3} maxLength={200} placeholder="e.g. Who should be our next Event Coordinator?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poll-description">Details (optional)</Label>
            <Textarea id="poll-description" name="description" rows={2} placeholder="Anything voters should know" />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Choices</legend>
            {options.map((value, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="type-readout w-5 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                <Input
                  name="option"
                  value={value}
                  maxLength={120}
                  required={i < 2}
                  placeholder={`Choice ${i + 1}`}
                  onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove choice ${i + 1}`}
                    onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < MAX_OPTIONS && (
              <Button type="button" variant="outline" size="sm" onClick={() => setOptions((prev) => [...prev, ""])}>
                <Plus className="size-4" /> Add choice
              </Button>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="poll-closes">Closes at (optional)</Label>
            <Input id="poll-closes" name="closes_at" type="datetime-local" />
            <p className="text-xs text-muted-foreground">India time. Leave empty to keep it open until you close it.</p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Create poll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
