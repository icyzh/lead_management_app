import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { createError } from "../middleware/errorHandler";
import { formatZodError } from "../lib/formatError";

const router = Router();

const VALID_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"] as const;

const CreateLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100, "Company must be 100 characters or less").optional(),
  status: z.enum(VALID_STATUSES).optional().default("NEW"),
});

const UpdateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  company: z.string().max(100).nullable().optional(),
  status: z.enum(VALID_STATUSES).optional(),
});

/**
 * GET /api/leads
 * Lists leads. Supports optional status filter and client-side case-insensitive text search.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query as { search?: string; status?: string };

    // Set up status filter query parameters
    const statusFilter =
      status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? { status }
        : {};

    // Get leads with counts of associated notes 
    let leads = await prisma.lead.findMany({
      where: statusFilter,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { notes: true } } },
    });

    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(
        (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
      );
    }

    res.json({ data: leads, total: leads.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leads/:id
 * fetch lead with notes
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { notes: { orderBy: { createdAt: "asc" } } },
    });
    if (!lead) return next(createError("Lead not found", 404));
    res.json({ data: lead });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/leads
 * Creates a new lead and check if email is unique
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(formatZodError(parsed.error), 422));
    }
    const { name, email, company, status } = parsed.data;

    // Check email uniqueness
    const existing = await prisma.lead.findUnique({ where: { email } });
    if (existing) return next(createError("A lead with this email already exists", 409));

    const lead = await prisma.lead.create({ data: { name, email, company, status } });
    res.status(201).json({ data: lead });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/leads/:id
 * Updates and handles dups
 */
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const parsed = UpdateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(formatZodError(parsed.error), 422));
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return next(createError("Lead not found", 404));

    if (parsed.data.email && parsed.data.email !== existing.email) {
      const taken = await prisma.lead.findUnique({ where: { email: parsed.data.email } });
      if (taken) return next(createError("Email already in use", 409));
    }

    const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
    res.json({ data: lead });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/leads/:id
 * Deletes a lead with notes
 */
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return next(createError("Lead not found", 404));
    await prisma.lead.delete({ where: { id } });
    res.json({ message: "Lead deleted" });
  } catch (err) {
    next(err);
  }
});

export { router as leadsRouter };
