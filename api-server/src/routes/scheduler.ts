import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { mAlumni, tSearchCandidates, tExtractedSignals } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const SOURCES = ["LinkedIn", "Google Scholar", "ResearchGate", "Google"] as const;

const SNIPPETS: Record<string, string[]> = {
  LinkedIn: [
    "Software Engineer at Google Indonesia | Universitas Indonesia Alumni",
    "Senior Data Scientist at Gojek | Ex-Tokopedia | Lulusan ITB 2018",
    "Product Manager at Shopee | MBA Graduate | Teknik Informatika",
    "Machine Learning Engineer at Grab | Research at NLP Lab",
    "Full Stack Developer at Bukalapak | Open Source Contributor",
  ],
  "Google Scholar": [
    "Published 12 papers in IEEE on Machine Learning and Computer Vision",
    "PhD Candidate at NUS, research on distributed systems and cloud computing",
    "Postdoctoral researcher at KAIST focusing on natural language processing",
    "Assistant Professor at UI, specializing in data mining and big data analytics",
    "Research Scientist at Microsoft Research Asia, citations: 847",
  ],
  ResearchGate: [
    "Co-author of 8 journal articles on biomedical engineering and signal processing",
    "Active contributor to open-source bioinformatics tools, ResearchGate score: 12.4",
    "Published thesis on renewable energy systems, cited by 34 papers",
    "Research interest: computational neuroscience and brain-computer interfaces",
  ],
  Google: [
    "Alumni of Universitas Indonesia, currently working in Singapore tech sector",
    "Mentioned in TechCrunch article about Indonesian startup ecosystem",
    "Speaker at DevFest Indonesia 2024, Teknik Informatika graduate",
    "Co-founder of EdTech startup based in Jakarta",
  ],
};

const SIGNAL_DATA: Record<string, Array<{ type: string; value: string }>> = {
  LinkedIn: [
    { type: "job_title", value: "Software Engineer" },
    { type: "company", value: "Google Indonesia" },
    { type: "location", value: "Jakarta, Indonesia" },
    { type: "education", value: "Universitas Indonesia" },
  ],
  "Google Scholar": [
    { type: "job_title", value: "Research Scientist" },
    { type: "company", value: "NUS Singapore" },
    { type: "location", value: "Singapore" },
    { type: "publication", value: "Machine Learning Applications in Healthcare" },
  ],
  ResearchGate: [
    { type: "job_title", value: "Postdoctoral Researcher" },
    { type: "company", value: "KAIST" },
    { type: "location", value: "South Korea" },
    { type: "publication", value: "Distributed Systems for Big Data Processing" },
  ],
  Google: [
    { type: "job_title", value: "Co-founder" },
    { type: "company", value: "StartupID" },
    { type: "location", value: "Jakarta, Indonesia" },
  ],
};

function calculateConfidenceScore(alumni: { name: string; major: string; graduationYear: number; affiliationKeywords: string[] }, source: string) {
  const nameMatchScore = 0.5 + Math.random() * 0.5;
  const affiliationScore = 0.3 + Math.random() * 0.7;
  const majorScore = 0.2 + Math.random() * 0.8;
  const timelineScore = 0.4 + Math.random() * 0.6;

  const confidence =
    nameMatchScore * 0.4 +
    affiliationScore * 0.3 +
    majorScore * 0.2 +
    timelineScore * 0.1;

  return {
    confidenceScore: Math.round(confidence * 100) / 100,
    nameMatchScore: Math.round(nameMatchScore * 100) / 100,
    affiliationScore: Math.round(affiliationScore * 100) / 100,
    majorScore: Math.round(majorScore * 100) / 100,
    timelineScore: Math.round(timelineScore * 100) / 100,
  };
}

router.post("/scheduler/run", async (_req, res) => {
  const startTime = Date.now();
  try {
    const allAlumni = await db.select().from(mAlumni);
    let newCandidates = 0;
    let identified = 0;
    let needsVerification = 0;
    let notFound = 0;

    for (const alumni of allAlumni) {
      const sourcesToCheck = SOURCES.filter(() => Math.random() > 0.3);

      if (sourcesToCheck.length === 0) {
        notFound++;
        await db.update(mAlumni).set({ trackingStatus: "Belum Ditemukan", updatedAt: new Date() }).where(eq(mAlumni.id, alumni.id));
        continue;
      }

      let highestScore = 0;

      for (const source of sourcesToCheck) {
        const scores = calculateConfidenceScore(alumni, source);
        highestScore = Math.max(highestScore, scores.confidenceScore);

        const snippets = SNIPPETS[source];
        const snippet = snippets[Math.floor(Math.random() * snippets.length)];

        const [candidate] = await db
          .insert(tSearchCandidates)
          .values({
            alumniId: alumni.id,
            source,
            sourceUrl: `https://example.com/${source.toLowerCase().replace(" ", "-")}/${alumni.name.toLowerCase().replace(" ", "-")}`,
            snippet,
            ...scores,
            status: "pending",
          })
          .returning();

        newCandidates++;

        const signals = SIGNAL_DATA[source] || [];
        for (const sig of signals) {
          await db.insert(tExtractedSignals).values({
            candidateId: candidate.id,
            signalType: sig.type as "job_title" | "company" | "location" | "education" | "publication",
            value: sig.value,
            source,
          });
        }
      }

      if (highestScore >= 0.7) {
        identified++;
        await db.update(mAlumni).set({ trackingStatus: "Teridentifikasi", updatedAt: new Date() }).where(eq(mAlumni.id, alumni.id));
      } else if (highestScore >= 0.4) {
        needsVerification++;
        await db.update(mAlumni).set({ trackingStatus: "Perlu Verifikasi Manual", updatedAt: new Date() }).where(eq(mAlumni.id, alumni.id));
      } else {
        notFound++;
        await db.update(mAlumni).set({ trackingStatus: "Belum Ditemukan", updatedAt: new Date() }).where(eq(mAlumni.id, alumni.id));
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    res.json({
      processed: allAlumni.length,
      newCandidatesFound: newCandidates,
      identified,
      needsVerification,
      notFound,
      duration: Math.round(duration * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/stats", async (_req, res) => {
  try {
    const allAlumni = await db.select().from(mAlumni);
    const total = allAlumni.length;
    const tracked = allAlumni.filter((a) => a.trackingStatus === "Teridentifikasi").length;
    const pending = allAlumni.filter((a) => a.trackingStatus === "Perlu Verifikasi Manual").length;
    const successRate = total > 0 ? Math.round((tracked / total) * 100 * 10) / 10 : 0;

    res.json({
      totalAlumni: total,
      tracked,
      pendingVerification: pending,
      successRate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
