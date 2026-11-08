"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Plus,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Trash2,
  FileQuestion,
  Users,
  Settings2,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  useOnboardingForms,
  useDeleteOnboardingForm,
  useAvailableProposals,
  useGenerateOnboardingForm,
  useSaveOnboardingForm,
} from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OnboardingDashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useOnboardingForms();
  const forms = data?.forms || [];

  const { data: proposalsData, isLoading: isLoadingProposals } =
    useAvailableProposals();
  const proposals = proposalsData?.proposals || [];

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<"proposal" | "custom">(
    "proposal"
  );
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [proposalSearch, setProposalSearch] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Manual create state
  const [customClientName, setCustomClientName] = useState("");
  const [customProjectTitle, setCustomProjectTitle] = useState("");
  const [customProjectType, setCustomProjectType] = useState("Web Application");

  const deleteMutation = useDeleteOnboardingForm({
    onSuccess: () => {
      toast.success("Onboarding form deleted.");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateMutation = useGenerateOnboardingForm({
    onSuccess: ({ form }) => {
      toast.success("AI generated onboarding form successfully!");
      setCreateDialogOpen(false);
      if (form) {
        router.push(`/admin/onboarding/${form.id}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const saveMutation = useSaveOnboardingForm({
    onSuccess: (form) => {
      toast.success("Form created.");
      setCreateDialogOpen(false);
      router.push(`/admin/onboarding/${form.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCopyLink(slug: string) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const url = `${origin}/onboard/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Client onboarding link copied to clipboard!");
    setTimeout(() => setCopiedSlug(null), 2500);
  }

  function handleGenerateFromProposal() {
    if (!selectedQuoteId) {
      toast.error("Please select a proposal first.");
      return;
    }
    generateMutation.mutate({
      quoteId: selectedQuoteId,
      save: true,
    });
  }

  function handleCreateCustom() {
    if (!customClientName.trim() || !customProjectTitle.trim()) {
      toast.error("Please enter client name and project title.");
      return;
    }

    saveMutation.mutate({
      client_name: customClientName.trim(),
      project_title: customProjectTitle.trim(),
      title: `${customProjectTitle.trim()} Onboarding`,
      description: `Welcome to Zaid Studio! Please complete this onboarding form for ${customClientName.trim()}.`,
      status: "published",
      fields: [
        {
          id: "brand_assets",
          type: "file",
          label: "Logo & Brand Guidelines Link",
          description: "Provide Google Drive or Dropbox link to your brand assets and logo (SVG preferred).",
          placeholder: "https://drive.google.com/...",
          required: true,
          category: "Brand & Assets",
        },
        {
          id: "project_goals",
          type: "textarea",
          label: "Core Project Goals & Priorities",
          description: "What are the most critical outcomes or features for this initial release?",
          placeholder: "Launch fast with high conversion rate and smooth onboarding...",
          required: true,
          category: "Project Requirements",
        },
        {
          id: "primary_contact",
          type: "text",
          label: "Primary Approver & Decision Maker",
          description: "Who should we contact for milestone sign-offs?",
          placeholder: `${customClientName} (Founder)`,
          required: true,
          category: "Governance",
        },
      ],
    });
  }

  const filteredProposals = proposals.filter(
    (p) =>
      p.name.toLowerCase().includes(proposalSearch.toLowerCase()) ||
      p.project_type.toLowerCase().includes(proposalSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(proposalSearch.toLowerCase())
  );

  const totalSubmissions = forms.reduce(
    (acc, f) => acc + (f.submissions_count || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Client Onboarding</h1>
            <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400">
              Form Builder
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build and manage customized onboarding questionnaires. Auto-generate questions directly from approved proposals using AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setCreationMode("proposal");
              setCreateDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Sparkles className="mr-2 size-4" />
            Generate from Proposal
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setCreationMode("custom");
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Blank Form
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Forms
            </span>
            <ClipboardCheck className="size-4 text-blue-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">{forms.length}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Published & Active
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">
            {forms.filter((f) => f.status === "published").length}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Submissions Received
            </span>
            <Users className="size-4 text-purple-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">{totalSubmissions}</p>
        </div>
      </div>

      {/* Forms Listing */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/60 p-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : forms.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center bg-card/20">
          <div className="rounded-full bg-blue-500/10 p-4 text-blue-500 mb-4">
            <FileQuestion className="size-8" />
          </div>
          <h3 className="text-lg font-semibold">No onboarding forms created yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Generate an onboarding questionnaire from an existing proposal or build one from scratch to onboard your clients seamlessly.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => {
                setCreationMode("proposal");
                setCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Sparkles className="mr-2 size-4" />
              Generate from Proposal
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreationMode("custom");
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Build Blank Form
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {forms.map((form) => {
              const categories = Array.from(
                new Set(
                  form.fields
                    .map((f) => f.category)
                    .filter((c): c is string => Boolean(c))
                )
              );

              return (
                <motion.div
                  key={form.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm transition-all hover:border-border hover:bg-card/70 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">
                          {form.client_name}
                        </span>
                        <h3 className="text-base font-semibold leading-tight line-clamp-1">
                          {form.title}
                        </h3>
                      </div>
                      <Badge
                        variant={
                          form.status === "published" ? "default" : "secondary"
                        }
                        className={
                          form.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {form.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {form.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Badge variant="outline" className="text-[11px] py-0 px-2 font-normal">
                        {form.fields.length} questions
                      </Badge>
                      {categories.slice(0, 2).map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-[11px] py-0 px-2 font-normal text-muted-foreground"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {categories.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-[11px] py-0 px-1.5 font-normal text-muted-foreground"
                        >
                          +{categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-border/40 pt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <button
                        onClick={() =>
                          router.push(`/admin/onboarding/${form.id}/submissions`)
                        }
                        className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors"
                      >
                        <Users className="size-3.5 text-purple-400" />
                        <span className="underline decoration-dotted underline-offset-4">
                          {form.submissions_count || 0} response
                          {(form.submissions_count || 0) === 1 ? "" : "s"}
                        </span>
                      </button>

                      <span className="text-[11px]">
                        {new Date(form.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs h-8"
                        onClick={() => router.push(`/admin/onboarding/${form.id}`)}
                      >
                        <Settings2 className="mr-1.5 size-3.5" />
                        Open Builder
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        title="Copy Public Client Link"
                        onClick={() => handleCopyLink(form.slug)}
                      >
                        {copiedSlug === form.slug ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        title="Open Live Form"
                        onClick={() =>
                          window.open(`/onboard/${form.slug}`, "_blank")
                        }
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        title="Delete Form"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete onboarding form for "${form.client_name}"?`
                            )
                          ) {
                            deleteMutation.mutate(form.id);
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Generate Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-500" />
              Create Client Onboarding Form
            </DialogTitle>
            <DialogDescription>
              Choose whether to auto-generate questions from an existing proposal or start with a custom template.
            </DialogDescription>
          </DialogHeader>

          <div className="flex rounded-lg bg-secondary/50 p-1 mb-4">
            <button
              onClick={() => setCreationMode("proposal")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                creationMode === "proposal"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Generate from Proposal (AI)
            </button>
            <button
              onClick={() => setCreationMode("custom")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                creationMode === "custom"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Blank Form
            </button>
          </div>

          {creationMode === "proposal" ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals by client or project..."
                  value={proposalSearch}
                  onChange={(e) => setProposalSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {isLoadingProposals ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProposals.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No matching proposals found.
                  </p>
                ) : (
                  filteredProposals.map((prop) => {
                    const isSelected = selectedQuoteId === prop.id;
                    return (
                      <div
                        key={prop.id}
                        onClick={() => setSelectedQuoteId(prop.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-border/60 hover:bg-secondary/40"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold">{prop.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {prop.project_type} • {prop.estimated_timeline || "Agile"}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {prop.summary}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {prop.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={generateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateFromProposal}
                  disabled={!selectedQuoteId || generateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Analyzing Proposal & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Generate & Open Builder
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Client Name *
                </label>
                <Input
                  placeholder="e.g. Acme Corp / Sarah Jenkins"
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Project Title *
                </label>
                <Input
                  placeholder="e.g. Acme SaaS Platform MVP"
                  value={customProjectTitle}
                  onChange={(e) => setCustomProjectTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Project Type
                </label>
                <Input
                  placeholder="e.g. E-commerce / Web Application / Landing Page"
                  value={customProjectType}
                  onChange={(e) => setCustomProjectType(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustom}
                  disabled={
                    !customClientName.trim() ||
                    !customProjectTitle.trim() ||
                    saveMutation.isPending
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 size-4" />
                      Create & Open Builder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
