import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../../../modules/support-tickets"
import SupportTicketModuleService from "../../../../../modules/support-tickets/service"
import { revalidateStorefrontOrders } from "../../../../../utils/revalidate-storefront"
import { requireAdmin, requireId, requireText } from "../../../../../utils/auth"

type AddMessageBody = {
  message: string
}

// POST /admin/support-tickets/:id/messages -> admin konuşmaya cevap yazar
export async function POST(
  req: MedusaRequest<AddMessageBody>,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const id = requireId(req.params.id)
  const message = requireText(req.body.message, "message")

  const ticket = await service.addMessage(id, "admin", message)

  await revalidateStorefrontOrders()

  res.status(201).json({ support_ticket: ticket })
}
