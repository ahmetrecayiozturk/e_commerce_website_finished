import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../../modules/return-requests/service"
import { Modules } from "@medusajs/framework/utils"
import { requireCustomer, requireId, requireText } from "../../../../../utils/auth"
// GET /store/orders/:id/return-requests -> müşteri kendi iade taleplerinin durumunu görür
export async function GET(
  req: MedusaRequest,
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

  const requests = await service.listReturnRequests(
    { order_id: orderId, type: "return", customer_id: customerId } as any,
    { order: { created_at: "DESC" } }
  )
  res.json({ return_requests: requests })
}

type CreateReturnRequestBody = {
  order_display_id?: number
  customer_email: string
  customer_name: string
  item_description: string
  reason: string
}

// POST /store/orders/:id/return-requests -> yeni iade talebi oluşturur (pending)
export async function POST(
  req: MedusaRequest<CreateReturnRequestBody>,
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
  const isFullyDelivered =
    items.length > 0 &&
    items.every((item: any) => {
      const detail = item.detail ?? {}
      const quantity = Number(detail.quantity ?? 0)
      const deliveredQuantity = Number(detail.delivered_quantity ?? 0)
      return deliveredQuantity >= quantity
    })

  if (!isFullyDelivered) {
    res.status(400).json({
      message:
        "İade talebi yalnızca teslim edilmiş siparişler için oluşturulabilir.",
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
    customer_id: customerId,
    customer_email: customer.email,
    customer_name: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() || customer.email,
    item_description,
    reason,
    status: "pending",
  })

  res.status(201).json({ return_request: request })
}
