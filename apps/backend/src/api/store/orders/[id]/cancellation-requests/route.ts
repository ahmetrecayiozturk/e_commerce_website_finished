import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { requireCustomer, requireId, requireText } from "../../../../../utils/auth"
import { RETURN_REQUEST_MODULE } from "../../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../../modules/return-requests/service"

// GET /store/orders/:id/cancellation-requests -> müşterinin iptal talebi durumu
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const customerId = requireCustomer(req)
  const orderId = requireId(req.params.id, "order_id")
  const orderService: any = req.scope.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(orderId)
  if (order.customer_id !== customerId) {
    res.status(403).json({ message: "Bu siparişe erişim yetkiniz yok." })
    return
  }

  const requests = await service.listReturnRequests(
    { order_id: orderId, type: "cancellation", customer_id: customerId } as any,
    { order: { created_at: "DESC" } }
  )

  res.json({ cancellation_requests: requests })
}

type CreateCancellationBody = {
  order_display_id?: number
  customer_email: string
  customer_name: string
  item_description: string
  reason: string
}

// POST /store/orders/:id/cancellation-requests -> yeni iptal talebi
// (yalnızca henüz kargoya verilmemiş/fulfill edilmemiş siparişler için)
export async function POST(
  req: MedusaRequest<CreateCancellationBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const customerId = requireCustomer(req)
  const orderId = requireId(req.params.id, "order_id")

  const orderModuleService: any = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  if (order.customer_id !== customerId) {
    res.status(403).json({ message: "Bu siparişe erişim yetkiniz yok." })
    return
  }

  const items = (order as any).items ?? []
  const hasAnyFulfillment = items.some((item: any) => {
    const detail = item.detail ?? {}
    const fulfilledQuantity = Number(detail.fulfilled_quantity ?? 0)
    return fulfilledQuantity > 0
  })

  if (hasAnyFulfillment) {
    res.status(400).json({
      message:
        "Bu sipariş kargoya verilmiş, artık iptal talebi oluşturulamaz. İade talebi oluşturabilirsiniz.",
    })
    return
  }

  const customerService: any = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(customerId)
  const item_description = requireText(req.body.item_description, "item_description")
  const reason = requireText(req.body.reason, "reason")

  const request = await service.createReturnRequests({
    order_id: orderId,
    order_display_id: req.body.order_display_id,
    type: "cancellation",
    customer_id: customerId,
    customer_email: customer.email,
    customer_name: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || customer.email,
    item_description,
    reason,
    status: "pending",
  } as any)

  res.status(201).json({ cancellation_request: request })
}