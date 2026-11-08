"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CopyPlus,
  Type,
  AlignLeft,
  ListFilter,
  CheckSquare,
  CircleDot,
  Link2,
  UploadCloud,
  Calendar,
  Hash,
  Heading,
  Eye,
  SlidersHorizontal,
  X,
  FileQuestion,
  Users,
} from "lucide-react";
import {
  useOnboardingForm,
  useSaveOnboardingForm,
  useGenerateOnboardingForm,
} from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FormField, FormFieldType, OnboardingForm } from "@/lib/types/onboarding";

const FIELD_TYPE_CONFIG: Record<
  FormFieldType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultPlaceholder: string;
  }
> = {
  text: {
    label: "Short Text",
    icon: Type,
    defaultPlaceholder: "e.g. Acme Corp / mydomain.com",
  },
  textarea: {
    label: "Long Answer",
    icon: AlignLeft,
    defaultPlaceholder: "Provide detailed background, context, or instructions...",
  },
  select: {
    label: "Dropdown Select",
    icon: ListFilter,
    defaultPlaceholder: "Select an option",
  },
  radio: {
    label: "Single Choice",
    icon: CircleDot,
    defaultPlaceholder: "",
  },
  checkbox: {
    label: "Multiple Choice",
    icon: CheckSquare,
    defaultPlaceholder: "",
  },
  url: {
    label: "Web / Figma Link",
    icon: Link2,
    defaultPlaceholder: "https://figma.com/file/... or https://github.com/...",
  },
  file: {
    label: "Asset / Drive Link",
    icon: UploadCloud,
    defaultPlaceholder: "https://drive.google.com/drive/folders/...",
  },
  date: {
    label: "Target Date",
    icon: Calendar,
    defaultPlaceholder: "YYYY-MM-DD",
  },
  number: {
    label: "Numeric Value",
    icon: Hash,
    defaultPlaceholder: "0",
  },
  section_header: {
    label: "Section Header",
    icon: Heading,
    defaultPlaceholder: "Section Description",
  },
};

function createFieldId(): string {
  return `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useOnboardingForm(id);

  if (isLoading || !data?.form) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <FormBuilderWorkspace initialForm={data.form} />;
}

function FormBuilderWorkspace({ initialForm }: { initialForm: OnboardingForm }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form State initialized from initialForm
  const [title, setTitle] = useState(initialForm.title || "");
  const [description, setDescription] = useState(initialForm.description || "");
  const clientName = initialForm.client_name || "";
  const projectTitle = initialForm.project_title || "";
  const [status, setStatus] = useState<"draft" | "published">(
    initialForm.status === "draft" ? "draft" : "published"
  );
  const [fields, setFields] = useState<FormField[]>(initialForm.fields || []);

  // AI Refresh Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState("");

  const saveMutation = useSaveOnboardingForm({
    onSuccess: () => {
      setIsDirty(false);
      toast.success("Onboarding form saved successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const aiMutation = useGenerateOnboardingForm({
    onSuccess: ({ generated }) => {
      if (generated?.fields?.length) {
        setTitle(generated.title || title);
        setDescription(generated.description || description);
        setFields(generated.fields);
        setIsDirty(true);
        setAiModalOpen(false);
        toast.success(`Generated ${generated.fields.length} questions from proposal!`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSave() {
    saveMutation.mutate({
      id: initialForm.id,
      title,
      description,
      client_name: clientName,
      project_title: projectTitle,
      status,
      fields,
    });
  }

  function handleCopyLink() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const url = `${origin}/onboard/${initialForm.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Public client link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // Element Actions
  function addElement(type: FormFieldType, index?: number) {
    const config = FIELD_TYPE_CONFIG[type];
    const newField: FormField = {
      id: createFieldId(),
      type,
      label: type === "section_header" ? "New Section" : `New ${config.label}`,
      placeholder: config.defaultPlaceholder,
      description: "",
      required: type !== "section_header",
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? ["Option 1", "Option 2", "Option 3"]
          : undefined,
      category: "General",
    };

    setFields((prev) => {
      const next = [...prev];
      if (typeof index === "number") {
        next.splice(index + 1, 0, newField);
      } else {
        next.push(newField);
      }
      return next;
    });
    setIsDirty(true);
    toast.success(`Added ${config.label}`);
  }

  function deleteElement(fieldId: string) {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setIsDirty(true);
    toast.success("Element deleted.");
  }

  function duplicateElement(fieldId: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === fieldId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const copy: FormField = {
        ...target,
        id: createFieldId(),
        label: `${target.label} (Copy)`,
        options: target.options ? [...target.options] : undefined,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setIsDirty(true);
    toast.success("Element duplicated.");
  }

  function moveElement(fieldId: string, direction: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === fieldId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
    setIsDirty(true);
  }

  function updateFieldProperty<K extends keyof FormField>(
    fieldId: string,
    key: K,
    value: FormField[K]
  ) {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f))
    );
    setIsDirty(true);
  }

  function addOption(fieldId: string) {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const currentOptions = f.options || [];
          return {
            ...f,
            options: [...currentOptions, `Option ${currentOptions.length + 1}`],
          };
        }
        return f;
      })
    );
    setIsDirty(true);
  }

  function updateOption(fieldId: string, optIndex: number, text: string) {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOpts = [...f.options];
          newOpts[optIndex] = text;
          return { ...f, options: newOpts };
        }
        return f;
      })
    );
    setIsDirty(true);
  }

  function removeOption(fieldId: string, optIndex: number) {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          const newOpts = f.options.filter((_, i) => i !== optIndex);
          return { ...f, options: newOpts };
        }
        return f;
      })
    );
    setIsDirty(true);
  }

  function handleAiRegenerate() {
    aiMutation.mutate({
      quoteId: initialForm.quote_id || undefined,
      clientName: clientName || initialForm.client_name,
      projectType: projectTitle || initialForm.project_title,
      customContext: aiPromptContext,
    });
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/95 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/admin/onboarding")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                {clientName}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {projectTitle}
              </span>
              {isDirty && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] py-0"
                >
                  Unsaved changes
                </Badge>
              )}
            </div>
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-secondary/60 p-1">
            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "builder"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              Builder
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="size-3.5" />
              Client Preview
            </button>
          </div>

          {/* Status Switcher */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "draft" | "published");
              setIsDirty(true);
            }}
            aria-label="Form status"
            className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs font-medium"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* AI Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="mr-1.5 size-3.5" />
            AI Refresh
          </Button>

          {/* Copy Public Link */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={handleCopyLink}
          >
            {copiedLink ? (
              <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-500" />
            ) : (
              <Copy className="mr-1.5 size-3.5" />
            )}
            {copiedLink ? "Copied" : "Copy Link"}
          </Button>

          {/* Submissions Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() =>
              router.push(`/admin/onboarding/${initialForm.id}/submissions`)
            }
          >
            <Users className="mr-1.5 size-3.5 text-purple-400" />
            Responses
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Element Palette */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-20 rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Add Form Elements
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Click any element to append it to the questionnaire.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(FIELD_TYPE_CONFIG) as FormFieldType[]).map(
                  (type) => {
                    const item = FIELD_TYPE_CONFIG[type];
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => addElement(type)}
                        className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-secondary/30 px-3 py-2 text-xs font-medium transition-all hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-left"
                      >
                        <IconComponent className="size-3.5 text-muted-foreground group-hover:text-blue-400" />
                        <span>{item.label}</span>
                        <Plus className="ml-auto size-3 text-muted-foreground" />
                      </button>
                    );
                  }
                )}
              </div>

              <div className="pt-2 border-t border-border/40 space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Quick AI Prompts
                </span>
                <button
                  onClick={() => {
                    aiMutation.mutate({
                      clientName,
                      projectType: projectTitle,
                      customContext:
                        "Focus heavily on technical access, cloud providers, and API keys",
                    });
                  }}
                  className="w-full text-left rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 text-[11px] transition-colors flex items-center justify-between"
                >
                  <span>✨ Add Technical Questions</span>
                  <Plus className="size-3" />
                </button>
                <button
                  onClick={() => {
                    aiMutation.mutate({
                      clientName,
                      projectType: projectTitle,
                      customContext:
                        "Focus on visual design, brand logos, color guidelines, and UX reference links",
                    });
                  }}
                  className="w-full text-left rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-2 text-[11px] transition-colors flex items-center justify-between"
                >
                  <span>✨ Add Brand & Design Questions</span>
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Center Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {/* Header Details Card */}
            <div className="rounded-2xl border border-border/60 bg-card/30 p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Questionnaire Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Acme Corp Onboarding & Kickoff"
                  className="text-base font-semibold h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Welcome Subtitle / Instructions for Client
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Explain why this form is important and how it helps the kickoff..."
                  className="text-xs min-h-[64px]"
                />
              </div>
            </div>

            {/* Field Elements Canvas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Questions ({fields.length})
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Use arrows to rearrange
                </span>
              </div>

              {fields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center bg-card/10 space-y-3">
                  <FileQuestion className="mx-auto size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No questions in this form yet.</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Pick an element from the left palette or let AI generate questions based on the proposal.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => addElement("text")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, idx) => {
                    const typeConfig = FIELD_TYPE_CONFIG[field.type];
                    const IconComponent = typeConfig?.icon || Type;
                    const isHeader = field.type === "section_header";

                    return (
                      <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative rounded-2xl border p-4 transition-all shadow-sm ${
                          isHeader
                            ? "border-blue-500/30 bg-blue-500/5"
                            : "border-border/60 bg-card/40 hover:border-border"
                        }`}
                      >
                        {/* Card Top Toolbar */}
                        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-2 flex items-center gap-1 bg-secondary/50"
                            >
                              <IconComponent className="size-3" />
                              {typeConfig?.label || field.type}
                            </Badge>

                            {!isHeader && (
                              <Input
                                value={field.category || ""}
                                onChange={(e) =>
                                  updateFieldProperty(
                                    field.id,
                                    "category",
                                    e.target.value
                                  )
                                }
                                placeholder="Category (e.g. Brand Assets)"
                                className="h-6 w-36 text-[11px] px-2 bg-transparent border-dashed"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!isHeader && (
                              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mr-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    updateFieldProperty(
                                      field.id,
                                      "required",
                                      e.target.checked
                                    )
                                  }
                                  className="rounded border-border size-3.5 accent-blue-600"
                                />
                                Required
                              </label>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Move Up"
                              disabled={idx === 0}
                              onClick={() => moveElement(field.id, "up")}
                            >
                              <ChevronUp className="size-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Move Down"
                              disabled={idx === fields.length - 1}
                              onClick={() => moveElement(field.id, "down")}
                            >
                              <ChevronDown className="size-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Duplicate Question"
                              onClick={() => duplicateElement(field.id)}
                            >
                              <CopyPlus className="size-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              title="Delete Question"
                              onClick={() => deleteElement(field.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Card Content Form */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              {isHeader ? "Section Heading" : "Question Label"}
                            </label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateFieldProperty(
                                  field.id,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Type the question title..."
                              className="text-xs font-medium h-8"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-muted-foreground">
                                Help Text / Context (Optional)
                              </label>
                              <Input
                                value={field.description || ""}
                                onChange={(e) =>
                                  updateFieldProperty(
                                    field.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Explain why this is needed..."
                                className="text-xs h-8"
                              />
                            </div>

                            {!isHeader && (
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">
                                  Placeholder Example
                                </label>
                                <Input
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateFieldProperty(
                                      field.id,
                                      "placeholder",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Example shown to client..."
                                  className="text-xs h-8"
                                />
                              </div>
                            )}
                          </div>

                          {/* Options Manager for Select, Radio, Checkbox */}
                          {(field.type === "select" ||
                            field.type === "radio" ||
                            field.type === "checkbox") && (
                            <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                  Choice Options
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-[11px] px-2 text-blue-400"
                                  onClick={() => addOption(field.id)}
                                >
                                  <Plus className="mr-1 size-3" />
                                  Add Option
                                </Button>
                              </div>

                              <div className="space-y-1.5">
                                {(field.options || []).map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span className="text-[10px] text-muted-foreground w-4 text-center">
                                      {optIdx + 1}.
                                    </span>
                                    <Input
                                      value={opt}
                                      onChange={(e) =>
                                        updateOption(
                                          field.id,
                                          optIdx,
                                          e.target.value
                                        )
                                      }
                                      className="h-7 text-xs flex-1"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
                                      onClick={() =>
                                        removeOption(field.id, optIdx)
                                      }
                                    >
                                      <X className="size-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quick Insert between items */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 text-[10px] px-2.5 rounded-full shadow-md bg-background border border-border/80"
                            onClick={() => addElement("text", idx)}
                          >
                            <Plus className="mr-1 size-3" />
                            Add Question Here
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Live Client Preview Mode */
        <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 shadow-lg backdrop-blur-md space-y-8">
          <div className="space-y-2 border-b border-border/40 pb-6 text-center">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
              Zaid Studio • Client Onboarding
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title || "Project Onboarding"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {description ||
                "Please fill out the following questions so we can kick off your project smoothly."}
            </p>
          </div>

          <div className="space-y-6">
            {fields.map((field) => {
              if (field.type === "section_header") {
                return (
                  <div
                    key={field.id}
                    className="pt-4 border-t border-border/40 space-y-1"
                  >
                    <h3 className="text-lg font-bold">{field.label}</h3>
                    {field.description && (
                      <p className="text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-2 rounded-xl p-1">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </label>
                    {field.category && (
                      <span className="text-[10px] text-muted-foreground">
                        {field.category}
                      </span>
                    )}
                  </div>

                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}

                  {field.type === "text" && (
                    <Input
                      placeholder={field.placeholder}
                      className="text-xs h-9"
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      placeholder={field.placeholder}
                      className="text-xs min-h-[72px]"
                    />
                  )}

                  {field.type === "url" && (
                    <div className="relative">
                      <Link2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        placeholder={field.placeholder || "https://..."}
                        className="pl-9 text-xs h-9"
                      />
                    </div>
                  )}

                  {field.type === "file" && (
                    <div className="relative">
                      <UploadCloud className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        placeholder={
                          field.placeholder || "Paste Google Drive or Figma link..."
                        }
                        className="pl-9 text-xs h-9"
                      />
                    </div>
                  )}

                  {field.type === "date" && (
                    <Input type="date" className="text-xs h-9" />
                  )}

                  {field.type === "number" && (
                    <Input
                      type="number"
                      placeholder={field.placeholder || "0"}
                      className="text-xs h-9"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      aria-label={field.label}
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs"
                    >
                      <option value="">-- Choose an option --</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "radio" && (
                    <div className="space-y-1.5">
                      {(field.options || []).map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-border/40 p-2.5 text-xs hover:bg-secondary/30 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={field.id}
                            className="size-3.5 accent-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === "checkbox" && (
                    <div className="space-y-1.5">
                      {(field.options || []).map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-border/40 p-2.5 text-xs hover:bg-secondary/30 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="size-3.5 rounded border-border accent-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-border/40 pt-6">
            <Button
              className="w-full bg-blue-600 text-white font-medium hover:bg-blue-700 py-3 text-sm rounded-xl"
              onClick={() =>
                toast.info("This is a live preview. In client view, clicking this submits answers.")
              }
            >
              Submit Onboarding Information
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Preview Mode • Submission is simulated
            </p>
          </div>
        </div>
      )}

      {/* AI Refresh Dialog */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-blue-500" />
              Re-generate Questions with AI
            </DialogTitle>
            <DialogDescription>
              AI will analyze the proposal requirements and re-structure questions. You can add custom hints or focus areas below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Custom Focus / Instructions (Optional)
              </label>
              <Textarea
                value={aiPromptContext}
                onChange={(e) => setAiPromptContext(e.target.value)}
                placeholder="e.g. Focus on e-commerce catalog, shipping rules, and payment processor details..."
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setAiModalOpen(false)}
                disabled={aiMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAiRegenerate}
                disabled={aiMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {aiMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
