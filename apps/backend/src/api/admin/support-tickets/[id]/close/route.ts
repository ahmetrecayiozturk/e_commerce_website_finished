import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../../../modules/support-tickets"
import SupportTicketModuleService from "../../../../../modules/support-tickets/service"
import { requireAdmin, requireId } from "../../../../../utils/auth"

type UpdateStatusBody = {
  status: "open" | "closed"
}

// POST /admin/support-tickets/:id/close -> talebi kapat/tekrar aç
export async function POST(
  req: MedusaRequest<UpdateStatusBody>,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const id = requireId(req.params.id)
  const { status } = req.body

  if (!["open", "closed"].includes(status)) {
    res.status(400).json({ message: "Geçersiz status değeri." })
    return
  }

  const ticket = await service.updateSupportTickets({
    id,
    status: status as any,
  } as any)

  res.json({ support_ticket: ticket })
}
