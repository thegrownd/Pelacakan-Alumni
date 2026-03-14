import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { mAlumni, tSearchCandidates, tExtractedSignals } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/alumni", async (_req, res) => {
  try {
    const alumni = await db.select().from(mAlumni).orderBy(mAlumni.createdAt);
    const result = alumni.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alumni", async (req, res) => {
  try {
    const { name, major, graduationYear, nameVariations, affiliationKeywords } = req.body;
    const [created] = await db
      .insert(mAlumni)
      .values({
        name,
        major,
        graduationYear: Number(graduationYear),
        nameVariations: nameVariations || [],
        affiliationKeywords: affiliationKeywords || [],
      })
      .returning();
    res.status(201).json({
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/alumni/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [alumni] = await db.select().from(mAlumni).where(eq(mAlumni.id, id));
    if (!alumni) return res.status(404).json({ error: "Not found" });

    const candidates = await db.select().from(tSearchCandidates).where(eq(tSearchCandidates.alumniId, id));
    const candidatesWithSignals = await Promise.all(
      candidates.map(async (c) => {
        const signals = await db.select().from(tExtractedSignals).where(eq(tExtractedSignals.candidateId, c.id));
        return {
          ...c,
          createdAt: c.createdAt.toISOString(),
          signals: signals.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
        };
      })
    );

    res.json({
      ...alumni,
      createdAt: alumni.createdAt.toISOString(),
      updatedAt: alumni.updatedAt.toISOString(),
      candidates: candidatesWithSignals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/alumni/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, major, graduationYear, nameVariations, affiliationKeywords } = req.body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (major !== undefined) updateData.major = major;
    if (graduationYear !== undefined) updateData.graduationYear = Number(graduationYear);
    if (nameVariations !== undefined) updateData.nameVariations = nameVariations;
    if (affiliationKeywords !== undefined) updateData.affiliationKeywords = affiliationKeywords;

    const [updated] = await db
      .update(mAlumni)
      .set(updateData)
      .where(eq(mAlumni.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/alumni/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(mAlumni).where(eq(mAlumni.id, id));
    res.json({ success: true, message: "Alumni deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/candidates", async (req, res) => {
  try {
    const { alumniId, status } = req.query;
    const conditions = [];
    if (alumniId) conditions.push(eq(tSearchCandidates.alumniId, Number(alumniId)));
    if (status) conditions.push(eq(tSearchCandidates.status, status as "pending" | "verified" | "rejected"));

    const candidates =
      conditions.length > 0
        ? await db.select().from(tSearchCandidates).where(and(...conditions))
        : await db.select().from(tSearchCandidates);

    res.json(
      candidates.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/candidates/:id/verify", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [candidate] = await db
      .update(tSearchCandidates)
      .set({ status: "verified" })
      .where(eq(tSearchCandidates.id, id))
      .returning();
    if (!candidate) return res.status(404).json({ error: "Not found" });

    await db
      .update(mAlumni)
      .set({ trackingStatus: "Teridentifikasi", updatedAt: new Date() })
      .where(eq(mAlumni.id, candidate.alumniId));

    res.json({ ...candidate, createdAt: candidate.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/candidates/:id/reject", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [candidate] = await db
      .update(tSearchCandidates)
      .set({ status: "rejected" })
      .where(eq(tSearchCandidates.id, id))
      .returning();
    if (!candidate) return res.status(404).json({ error: "Not found" });
    res.json({ ...candidate, createdAt: candidate.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
