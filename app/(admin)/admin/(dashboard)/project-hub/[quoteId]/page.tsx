"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  proposalFormSchema,
  type ProposalForm,
} from "@/lib/validation/proposal-schema";
import {
  useGenerateProposal,
  useProjectHub,
  useSaveProposal,
  useCreateRevision,
  useProposalVersion,
  useResendProposalVersion,
} from "@/hooks/useProposal";
import { ProposalToolbar } from "../components/layout/ProposalToolbar";
import { ProposalPDF } from "@/app/components/ProposalPDF";
import { ProposalEditor } from "../components/layout/ProposalEditor";
import { ClientSidebar } from "../components/layout/ClientSidebar";
import { CardHeader, Card, CardTitle, CardContent } from "@/components/ui/card";
import { AGENCY_DEFAULTS } from "@/lib/ai/agency-defaults";
import { ProposalPreviewDialog } from "../components/dialogs/ProposalPreviewDialog";
import { useProposalPdf } from "@/hooks/useProposalPdf";
import { VersionHistoryCard } from "../cards/VersionHistoryCard";

const defaultProposal: ProposalForm = {
  summary: "",

  estimatedTimeline: "",

  estimatedCost: "",

  complexity: "Simple",

  deliverables: [],

  techStack: [],

  phases: [],

  clientResponsibilities: [],

  risks: [],

  nextSteps: [],

  supportPolicy: AGENCY_DEFAULTS.supportPolicy,

  paymentTerms: AGENCY_DEFAULTS.paymentTerms,

  ownershipTerms: AGENCY_DEFAULTS.ownershipTerms,
};

export default function ProposalBuilderPage() {
  const proposalPdf = useProposalPdf();
  const router = useRouter();
  const params = useParams<{
    quoteId: string;
  }>();
  const form = useForm<ProposalForm>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: defaultProposal,
    mode: "onChange",
  });

  const projectHub = useProjectHub(params.quoteId);

  const [adminNotes, setAdminNotes] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState("draft");

  const selectedVersion = useProposalVersion(
    selectedVersionId === "draft" ? null : selectedVersionId,
  );

  function handleEditVersion() {
    if (!selectedVersion.data) return;

    form.reset(selectedVersion.data);

    setSelectedVersionId("draft");

    toast.success(
      `v${selectedVersion.data.versionNumber} loaded into Current Draft.`,
    );
  }

  function handlePreviewVersion(versionId: string) {
    router.push(
      `/admin/project-hub/${params.quoteId}/preview?version=${versionId}`,
    );
  }

  const resendMutation = useResendProposalVersion({
    onSuccess: ({ versionNumber }) => {
      toast.success(`v${versionNumber} resent successfully.`);
      projectHub.refetch();
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleResendVersion(versionId: string) {
    resendMutation.mutate({ versionId });
  }

  async function handlePreview() {
    await proposalPdf.generatePdf(
      <ProposalPDF
        // temporary

        name={projectHub.data!.quote.name}
        project_type={projectHub.data!.quote.projectType}
        summary={form.getValues().summary}
        estimated_timeline={form.getValues().estimatedTimeline}
        estimated_cost={form.getValues().estimatedCost}
        complexity={form.getValues().complexity}
        deliverables={form.getValues().deliverables}
        tech_stack={form.getValues().techStack}
        phases={form.getValues().phases}
        client_responsibilities={form.getValues().clientResponsibilities}
        risks={form.getValues().risks}
        next_steps={form.getValues().nextSteps}
        quoteUrl=""
      />,
    );

    setPreviewOpen(true);
  }

  // const [generating, setGenerating] = useState(false);

  // const [saving, setSaving] = useState(false);

  // const dirty = form.formState.isDirty;

  useEffect(() => {
    if (selectedVersionId === "draft") {
      if (projectHub.data?.proposalDraft) {
        form.reset({
          ...defaultProposal,
          ...projectHub.data.proposalDraft,
        });
      }
      return;
    }

    if (selectedVersion.data) {
      form.reset({
        ...defaultProposal,
        ...selectedVersion.data,
      });
    }
  }, [selectedVersionId, projectHub.data, selectedVersion.data, form]);

  const viewingVersion = selectedVersionId !== "draft";

  const generateMutation = useGenerateProposal({
    onSuccess: ({ proposal }) => {
      form.reset(proposal);
      toast.success("Proposal generated successfully.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const saveMutation = useSaveProposal({
    onSuccess: () => {
      toast.success("Proposal saved successfully.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const revisionMutation = useCreateRevision({
    onSuccess: ({ version }) => {
      toast.success(`Revision v${version.versionNumber} created.`);
      projectHub.refetch();
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleCreateRevision() {
    revisionMutation.mutate({
      quoteId: params.quoteId,
    });
  }

  function handleGenerate() {
    generateMutation.mutate({
      quoteId: params.quoteId,
      adminNotes,
    });
  }

  function handleSave() {
    console.log(form.getValues());

    saveMutation.mutate({
      quoteId: params.quoteId,

      proposal: form.getValues(),
    });
  }

  if (projectHub.isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading proposal...
      </div>
    );
  }
  if (projectHub.isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unable to load project</CardTitle>
          </CardHeader>

          <CardContent>Please refresh the page or try again.</CardContent>
        </Card>
      </div>
    );
  }

  const isGenerating = generateMutation.isPending;

  const isSaving = saveMutation.isPending;

  // // Later
  // const isSending =  Mutation.isPending;

  const isBusy = isGenerating || isSaving || revisionMutation.isPending;

  return (
    <FormProvider {...form}>
      <div className="flex h-screen flex-col bg-background">
        <ProposalToolbar
          viewingVersion={viewingVersion}
          onEditVersion={handleEditVersion}
          quoteId={params.quoteId}
          title={`${projectHub.data!.quote.projectType} Proposal`}
          status="draft"
          versions={projectHub.data!.versions}
          selectedVersionId={selectedVersionId}
          onVersionChange={setSelectedVersionId}
          isGenerating={generateMutation.isPending}
          isSaving={saveMutation.isPending}
          isCreatingRevision={revisionMutation.isPending}
          onBack={() => router.push("/admin/quotes")}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onCreateRevision={handleCreateRevision}
          onPreview={handlePreview}
          onSend={() => {}}
          dirty={form.formState.isDirty}
          isBusy={isBusy}
        />

        <div className="flex flex-1 overflow-hidden">
          <ClientSidebar
            quote={projectHub.data!.quote}
            adminNotes={adminNotes}
            onAdminNotesChange={setAdminNotes}
          />

          <ProposalEditor readOnly={viewingVersion} />

          <div className="w-[320px] shrink-0 overflow-y-auto border-l bg-background/95 p-4 backdrop-blur">
            <VersionHistoryCard
              viewingDraft={!viewingVersion}
              versions={projectHub.data!.versions}
              onPreview={handlePreviewVersion}
              onResend={handleResendVersion}
              isResending={resendMutation.isPending}
              resendingVersionId={
                resendMutation.isPending ? selectedVersionId : null
              }
            />
          </div>
        </div>
        <ProposalPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          pdfUrl={proposalPdf.pdfUrl}
          generating={proposalPdf.generating}
          sending={false}
          onDownload={() =>
            proposalPdf.downloadPdf(
              `${projectHub.data!.quote.name}-proposal.pdf`,
            )
          }
          onSend={() => {}}
        />
      </div>
    </FormProvider>
  );
}
