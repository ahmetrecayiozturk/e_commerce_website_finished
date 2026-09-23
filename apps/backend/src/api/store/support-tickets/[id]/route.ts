import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../../modules/support-tickets"
import SupportTicketModuleService from "../../../../modules/support-tickets/service"
import { requireCustomer, requireId } from "../../../../utils/auth"

// GET /store/support-tickets/:id -> tek bir konuşmanın tüm mesajlarını getirir
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const customerId = requireCustomer(req)
  const id = requireId(req.params.id)

  const ticket = await service.retrieveSupportTicket(id)
  if (ticket.customer_id !== customerId) {
    res.status(403).json({ message: "Bu destek talebine erişim yetkiniz yok." })
    return
  }

  res.json({ support_ticket: ticket })
}
