import getPrisma from "../config/db.js";
import { logActivity } from "../middleware/activityLog.js";

const VALID_CATEGORIES = ["TECHNICAL", "BILLING", "KYC", "ACCOUNT", "OTHER"];

// ─── User-facing ───

export const createTicket = async (req, res) => {
  try {
    const { category, subject, message, phone } = req.body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Please select a valid category" });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const ticket = await getPrisma().supportTicket.create({
      data: {
        userId: req.user.id,
        category,
        subject: subject.trim(),
        message: message.trim(),
        phone: phone && phone.trim() ? phone.trim() : null,
      },
    });

    const user = await getPrisma().user.findUnique({ where: { id: req.user.id } });

    // Best-effort email — a support ticket is still created even if mail fails.
    try {
      const admins = await getPrisma().user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
        select: { email: true },
      });
      const { sendSupportTicketAdminNotification, sendSupportTicketConfirmation } = await import("../config/nodemailer.js");
      await Promise.allSettled([
        sendSupportTicketAdminNotification(admins.map((a) => a.email), ticket, user),
        sendSupportTicketConfirmation(user.email, user.name, ticket),
      ]);
    } catch (mailErr) {
      console.error("Support ticket email failed:", mailErr);
    }

    return res.status(201).json({
      message: "Your request has been submitted. Our team will contact you within 2-3 working hours.",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await getPrisma().supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Get my tickets error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Admin ───

export const adminGetTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [tickets, total, open, inProgress] = await Promise.all([
      getPrisma().supportTicket.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      getPrisma().supportTicket.count({ where }),
      getPrisma().supportTicket.count({ where: { status: "OPEN" } }),
      getPrisma().supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    return res.status(200).json({
      tickets,
      total,
      page: parseInt(page) || 1,
      limit: take,
      counts: { open, inProgress },
    });
  } catch (error) {
    console.error("Admin get tickets error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminGetTicketDetail = async (req, res) => {
  try {
    const ticket = await getPrisma().supportTicket.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Admin get ticket detail error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminUpdateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const existing = await getPrisma().supportTicket.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Ticket not found" });

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const isResolving = status && ["RESOLVED", "CLOSED"].includes(status) && !["RESOLVED", "CLOSED"].includes(existing.status);

    const ticket = await getPrisma().supportTicket.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(isResolving && { resolvedBy: req.user.id, resolvedAt: new Date() }),
      },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    await logActivity({
      userId: req.user.id,
      action: "SUPPORT_TICKET_UPDATED",
      page: "support-tickets",
      details: { ticketId: id, status, targetUserId: ticket.userId },
      req,
    });

    return res.status(200).json({ message: "Ticket updated", ticket });
  } catch (error) {
    console.error("Admin update ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
