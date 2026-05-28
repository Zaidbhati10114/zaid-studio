// components/ProposalPDF.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuotePhase {
  name: string;
  duration: string;
}

interface QuoteRisk {
  risk: string;
  mitigation: string;
}

export interface ProposalPDFProps {
  name: string;
  project_type?: string;
  summary?: string;
  estimated_timeline?: string;
  estimated_cost?: string;
  complexity?: string;
  deliverables?: string[];
  tech_stack?: string[];
  phases?: QuotePhase[];
  client_responsibilities?: string[];
  risks?: QuoteRisk[];
  next_steps?: string[];
  description?: string;
  quoteUrl: string;
}

// ─── Styles — light mode ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    color: "#171717",
  },

  // ── Header ──
  header: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  studioLabel: {
    fontSize: 9,
    color: "#2563eb",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    lineHeight: 1.2,
    marginBottom: 6,
  },
  complexityBadge: {
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
  },
  badge: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    letterSpacing: 0.5,
  },

  // ── Summary card ──
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionLabel: {
    fontSize: 8,
    color: "#2563eb",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10.5,
    color: "#374151",
    lineHeight: 1.6,
  },

  // ── Two-col stats ──
  statsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statCardGreen: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    marginTop: 4,
  },
  statValueGreen: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
    marginTop: 4,
  },
  statLabelGreen: {
    fontSize: 8,
    color: "#16a34a",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── Section ──
  section: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // ── Two col grid ──
  twoCol: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  colHalf: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // ── List items ──
  listItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#2563eb",
    marginTop: 4,
    flexShrink: 0,
  },
  bulletGreen: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#16a34a",
    marginTop: 4,
    flexShrink: 0,
  },
  listText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    flex: 1,
  },

  // ── Phases ──
  phaseRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  phaseNumWrap: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phaseNum: {
    fontSize: 8,
    color: "#2563eb",
    fontFamily: "Helvetica-Bold",
    width: 16,
    height: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 99,
    textAlign: "center",
    paddingTop: 2,
  },
  phaseName: {
    fontSize: 10,
    color: "#0a0a0a",
    fontFamily: "Helvetica-Bold",
  },
  phaseDuration: {
    fontSize: 9,
    color: "#6b7280",
  },

  // ── Tech tags ──
  tagRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  tag: {
    fontSize: 9,
    color: "#374151",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // ── Risk ──
  riskCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  riskTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#b45309",
    marginBottom: 4,
  },
  riskText: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.5,
  },

  // ── Next steps ──
  stepRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  stepNum: {
    fontSize: 9,
    color: "#2563eb",
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#eff6ff",
    borderRadius: 99,
    width: 18,
    height: 18,
    textAlign: "center",
    paddingTop: 3,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    flex: 1,
    paddingTop: 2,
  },

  // ── Footer ──
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 8,
    color: "#9ca3af",
  },
  footerUrl: {
    fontSize: 8,
    color: "#2563eb",
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function ProposalPDF({
  name,
  project_type,
  summary,
  estimated_timeline,
  estimated_cost,
  complexity = "Medium",
  deliverables = [],
  tech_stack = [],
  phases = [],
  client_responsibilities = [],
  risks = [],
  next_steps = [],
  quoteUrl,
}: ProposalPDFProps) {
  const title = project_type ? `${project_type} — ${name}` : name;

  return (
    <Document
      title={`Project Proposal — ${name}`}
      author="Zaid Studio"
      subject="Project Proposal"
    >
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.studioLabel}>Zaid Studio · Project Proposal</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.complexityBadge}>
            <Text style={styles.badge}>{complexity} complexity</Text>
          </View>
        </View>

        {/* ── SUMMARY ── */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Project Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* ── TIMELINE + COST ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.sectionLabel}>Timeline</Text>
            <Text style={styles.statValue}>
              {estimated_timeline ?? "To be confirmed"}
            </Text>
          </View>
          <View style={styles.statCardGreen}>
            <Text style={styles.statLabelGreen}>Estimate</Text>
            <Text style={styles.statValueGreen}>
              {estimated_cost ?? "To be confirmed"}
            </Text>
          </View>
        </View>

        {/* ── DELIVERABLES + CLIENT RESPONSIBILITIES ── */}
        {deliverables.length > 0 && (
          <View style={styles.twoCol} wrap={false}>
            <View style={styles.colHalf}>
              <Text style={styles.sectionLabel}>What You Get</Text>
              {deliverables.map((d, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={styles.bulletGreen} />
                  <Text style={styles.listText}>{d}</Text>
                </View>
              ))}
            </View>

            {client_responsibilities.length > 0 && (
              <View style={styles.colHalf}>
                <Text style={styles.sectionLabel}>What I Need From You</Text>
                {client_responsibilities.map((r, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{r}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── PHASES ── */}
        {phases.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionLabel}>Recommended Approach</Text>
            {phases.map((phase, i) => (
              <View key={i} style={styles.phaseRow} wrap={false}>
                <View style={styles.phaseNumWrap}>
                  <Text style={styles.phaseNum}>{i + 1}</Text>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                </View>
                <Text style={styles.phaseDuration}>{phase.duration}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── TECH STACK ── */}
        {tech_stack.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionLabel}>Tech Stack</Text>
            {/* Chunk into rows of 4 — flexWrap is unreliable in react-pdf */}
            {Array.from(
              { length: Math.ceil(tech_stack.length / 4) },
              (_, rowIndex) => (
                <View key={rowIndex} style={styles.tagRow}>
                  {tech_stack
                    .slice(rowIndex * 4, rowIndex * 4 + 4)
                    .map((tech) => (
                      <Text key={tech} style={styles.tag}>
                        {tech}
                      </Text>
                    ))}
                </View>
              ),
            )}
          </View>
        )}

        {/* ── RISKS ── */}
        {risks.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionLabel}>Risks & Mitigations</Text>
            {risks.map((r, i) => (
              <View key={i} style={styles.riskCard}>
                <Text style={styles.riskTitle}>{r.risk}</Text>
                <Text style={styles.riskText}>{r.mitigation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── NEXT STEPS ── */}
        {next_steps.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionLabel}>Next Steps</Text>
            {next_steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Generated by Zaid Studio · zaidstudio.vercel.app
          </Text>
          <Text style={styles.footerUrl}>{quoteUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}
