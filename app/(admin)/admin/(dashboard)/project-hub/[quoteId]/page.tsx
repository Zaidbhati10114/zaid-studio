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
} from "@/hooks/useProposal";
import { ProposalToolbar } from "../components/layout/ProposalToolbar";
import { ProposalPDF } from "@/app/components/ProposalPDF";
import { ProposalEditor } from "../components/layout/ProposalEditor";
import { ClientSidebar } from "../components/layout/ClientSidebar";
import { CardHeader, Card, CardTitle, CardContent } from "@/components/ui/card";
import { AGENCY_DEFAULTS } from "@/lib/ai/agency-defaults";
import { ProposalPreviewDialog } from "../components/dialogs/ProposalPreviewDialog";
import { useProposalPdf } from "@/hooks/useProposalPdf";

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
    if (!projectHub.data) return;

    const { proposalDraft } = projectHub.data;

    if (proposalDraft) {
      // console.log("proposalDraft");
      // console.log(projectHub.data.proposalDraft);
      form.reset({
        ...defaultProposal,
        ...proposalDraft,
      });
    }
  }, [projectHub.data, form]);

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

  const isBusy = isGenerating || isSaving;

  return (
    <FormProvider {...form}>
      <div className="flex h-screen flex-col bg-background">
        <ProposalToolbar
          quoteId={params.quoteId}
          title={`${projectHub.data!.quote.projectType} Proposal`}
          status="draft"
          isGenerating={generateMutation.isPending}
          isSaving={saveMutation.isPending}
          onBack={() => router.push("/admin/quotes")}
          onGenerate={handleGenerate}
          onSave={handleSave}
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

          <ProposalEditor />
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
