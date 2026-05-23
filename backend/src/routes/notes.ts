import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { createError } from "../middleware/errorHandler";
import { formatZodError } from "../lib/formatError";

const router = Router();

const CreateNoteSchema = z.object({
  leadId: z.string().min(1),
  content: z.string().min(1, "Note cannot be empty").max(2000, "Note must be 2000 characters or less"),
});

/**
 * GET /api/notes/:leadId
 * Retrieves all notes associated with a given leadId, sorted chronologically (oldest first).
 */
router.get("/:leadId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = String(req.params.leadId);
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return next(createError("Lead not found", 404));
    
    const notes = await prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ data: notes });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notes
 * Adds a new activity/interaction note to a specific lead.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(formatZodError(parsed.error), 422));
    }
    const { leadId, content } = parsed.data;
    
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return next(createError("Lead not found", 404));
    
    const note = await prisma.note.create({ data: { leadId, content } });
    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/notes/:id
 * Deletes an individual note by its unique identifier.
 */
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) return next(createError("Note not found", 404));
    await prisma.note.delete({ where: { id } });
    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
});

export { router as notesRouter };
