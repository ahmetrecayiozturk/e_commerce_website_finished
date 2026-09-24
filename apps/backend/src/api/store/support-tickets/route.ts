import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../modules/support-tickets"
import SupportTicketModuleService from "../../../modules/support-tickets/service"
import { Modules } from "@medusajs/framework/utils"
import { requireCustomer, requireId, requireText } from "../../../utils/auth"

// GET /store/support-tickets?email=... -> müşterinin kendi taleplerini listeler
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const customerId = requireCustomer(req)

  const tickets = await service.listSupportTickets(
    { customer_id: customerId },
    { order: { created_at: "DESC" } }
  )

  res.json({ support_tickets: tickets })
}

type CreateTicketBody = {
  order_id?: string
  order_display_id?: number
  customer_email?: string
  customer_name?: string
  subject: string
  message: string
}

// POST /store/support-tickets -> yeni destek talebi (konuşması) başlatır
export async function POST(
  req: MedusaRequest<CreateTicketBody>,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const customerId = requireCustomer(req)
  const customerService: any = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(customerId)
  const order_id = req.body.order_id
    ? requireId(req.body.order_id, "order_id")
    : undefined
  if (order_id) {
    const orderService: any = req.scope.resolve(Modules.ORDER)
    const order = await orderService.retrieveOrder(order_id)
    if (order.customer_id !== customerId) {
      res.status(403).json({ message: "Bu siparişe erişim yetkiniz yok." })
      return
    }
  }
  const subject = requireText(req.body.subject, "subject", 200)
  const message = requireText(req.body.message, "message")

  const ticket = await service.createSupportTickets({
    customer_id: customerId,
    order_id,
    order_display_id: req.body.order_display_id,
    customer_email: customer.email,
    customer_name: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || customer.email,
    subject,
    status: "open",
    messages: [
      {
        sender: "customer",
        message,
        created_at: new Date().toISOString(),
      },
    ] as any,
  } as any)

  res.status(201).json({ support_ticket: ticket })
}
