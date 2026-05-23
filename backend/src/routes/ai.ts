import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { summarizeNotes } from "../services/ai.service";
import { createError } from "../middleware/errorHandler";

const router = Router();
const prisma = new PrismaClient();

// Schema for input validation
const SummarizeSchema = z.object({
  leadId: z.string().min(1),
});

/**
 * POST /api/ai/summarize
 * Generates an AI-powered summary draft from a lead's chronological notes.
 */
router.post("/summarize", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request parameter schema
    const parsed = SummarizeSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(parsed.error.errors.map((e) => e.message).join(", "), 422));
    }

    const { leadId } = parsed.data;

    // Fetch the lead along with all notes
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { notes: { orderBy: { createdAt: "asc" } } },
    });

    if (!lead) return next(createError("Lead not found", 404));
    if (lead.notes.length === 0) return next(createError("No notes to summarize", 400));

    // Call llm api
    const result = await summarizeNotes(lead.name, lead.notes);

    // return a summary draft
    res.json({
      data: {
        summary: result.summary,
        model: result.model,
        notesCount: lead.notes.length,
        leadName: lead.name,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith("summarize failed")) {
      return next(createError(err.message, 502));
    }
    next(err);
  }
});

export { router as aiRouter };
