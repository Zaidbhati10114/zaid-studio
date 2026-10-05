"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type GeneratedMessage = {
  id: string;
  approach_lead_id: string;
  content: string;
  selected: boolean;
  created_at: string;
};

export function ApproachForm() {
  const [businessName, setBusinessName] = useState("");
  const [businessDetails, setBusinessDetails] = useState("");
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [extraNotes, setExtraNotes] = useState("");

  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectingMessageId, setSelectingMessageId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setCopiedMessageId(null);

    const trimmedBusinessName = businessName.trim();
    const trimmedBusinessDetails = businessDetails.trim();

    if (!trimmedBusinessName) {
      setError("Business name is required.");
      return;
    }

    if (!trimmedBusinessDetails) {
      setError("Business details are required.");
      return;
    }

    if (hasWebsite === null) {
      setError("Please select whether the business has a website.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/admin/approach-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: trimmedBusinessName,
          businessDetails: trimmedBusinessDetails,
          hasWebsite,
          extraNotes: extraNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate approach message.");
      }

      setMessage(data.message);
      setMessages([data.message]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the message.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate() {
    if (!message) {
      return;
    }

    setError(null);
    setCopiedMessageId(null);

    try {
      setIsRegenerating(true);

      const response = await fetch(
        `/api/admin/approach-messages/${message.approach_lead_id}/regenerate`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to regenerate approach message.");
      }

      setMessage(data.message);

      setMessages((current) => [data.message, ...current]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while regenerating the message.",
      );
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleCopy(targetMessage: GeneratedMessage) {
    try {
      await navigator.clipboard.writeText(targetMessage.content);

      setCopiedMessageId(targetMessage.id);

      window.setTimeout(() => {
        setCopiedMessageId((current) =>
          current === targetMessage.id ? null : current,
        );
      }, 2000);
    } catch {
      setError("Could not copy the message.");
    }
  }

  async function handleSelectMessage(targetMessage: GeneratedMessage) {
    if (targetMessage.id === message?.id && targetMessage.selected) {
      return;
    }

    setError(null);

    try {
      setSelectingMessageId(targetMessage.id);

      const response = await fetch(
        `/api/admin/approach-messages/${targetMessage.approach_lead_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId: targetMessage.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to select approach message.");
      }

      setMessages((current) =>
        current.map((item) => ({
          ...item,
          selected: item.id === targetMessage.id,
        })),
      );

      setMessage({
        ...targetMessage,
        selected: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while selecting the message.",
      );
    } finally {
      setSelectingMessageId(null);
    }
  }

  const previousMessages = messages.slice(1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prospect details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business name</Label>

              <Input
                id="business-name"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="e.g. Aarav Jewellery"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-details">Business details</Label>

              <Textarea
                id="business-details"
                value={businessDetails}
                onChange={(event) => setBusinessDetails(event.target.value)}
                placeholder="Tell us what this business does, what they sell, how they operate, or anything useful you noticed..."
                className="min-h-32 resize-y"
                disabled={isGenerating}
              />

              <p className="text-xs text-muted-foreground">
                Add whatever you know from Instagram, Google, their store, or
                your own research.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Does the business have a website?</Label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasWebsite(true)}
                  disabled={isGenerating}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    hasWebsite === true
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium">Yes</span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    They have a website
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasWebsite(false)}
                  disabled={isGenerating}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    hasWebsite === false
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium">No</span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    They do not have one
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-notes">
                Extra notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>

              <Textarea
                id="extra-notes"
                value={extraNotes}
                onChange={(event) => setExtraNotes(event.target.value)}
                placeholder="Anything else worth mentioning..."
                className="min-h-24 resize-y"
                disabled={isGenerating}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating message...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Generated message</CardTitle>
          </CardHeader>

          <CardContent>
            {message ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7">
                    {message.content}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopy(message)}
                  >
                    {copiedMessageId === message.id ? (
                      <>
                        <Check className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy Message
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium">
                  Your message will appear here
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                  Add the prospect details and generate a short, personalized
                  approach message.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {previousMessages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previous versions</CardTitle>

              <p className="text-xs text-muted-foreground">
                Regenerated messages are kept here so you never lose an earlier
                version.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {previousMessages.map((previousMessage, index) => {
                const versionNumber = messages.length - index - 1;

                return (
                  <div
                    key={previousMessage.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          Version {versionNumber}
                        </span>

                        {previousMessage.selected && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            Selected
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {new Date(previousMessage.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {previousMessage.content}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(previousMessage)}
                      >
                        {copiedMessageId === previousMessage.id ? (
                          <>
                            <Check className="size-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            Copy
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectMessage(previousMessage)}
                        disabled={selectingMessageId === previousMessage.id}
                      >
                        {selectingMessageId === previousMessage.id ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Selecting...
                          </>
                        ) : previousMessage.selected ? (
                          <>
                            <Check className="size-4" />
                            Selected
                          </>
                        ) : (
                          "Use this version"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
