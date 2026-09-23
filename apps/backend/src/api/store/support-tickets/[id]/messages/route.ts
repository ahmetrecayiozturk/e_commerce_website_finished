import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../../../modules/support-tickets"
import SupportTicketModuleService from "../../../../../modules/support-tickets/service"
import { requireCustomer, requireId, requireText } from "../../../../../utils/auth"

type AddMessageBody = {
  message: string
}

// POST /store/support-tickets/:id/messages -> müşteri konuşmaya cevap yazar
export async function POST(
  req: MedusaRequest<AddMessageBody>,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const customerId = requireCustomer(req)
  const id = requireId(req.params.id)
  const existingTicket = await service.retrieveSupportTicket(id)
  if (existingTicket.customer_id !== customerId) {
    res.status(403).json({ message: "Bu destek talebine erişim yetkiniz yok." })
    return
  }
  const message = requireText(req.body.message, "message")

  const ticket = await service.addMessage(id, "customer", message)

  res.status(201).json({ support_ticket: ticket })
}
