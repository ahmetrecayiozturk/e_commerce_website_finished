import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../modules/shipment-tracking/service"
import { Modules } from "@medusajs/framework/utils"
import { requireCustomer, requireId } from "../../../../../utils/auth"

// GET /store/orders/:id/tracking -> müşterinin sipariş takip sayfasında
// kullanacağı kargo bilgisi (carrier, tracking_number, tracking_url,
// güncel durum ve durum geçmişi)
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const customerId = requireCustomer(req)
  const orderId = requireId(req.params.id, "order_id")
  const orderService: any = req.scope.resolve(Modules.ORDER)
  const order = await orderService.retrieveOrder(orderId)
  if (order.customer_id !== customerId) {
    res.status(403).json({ message: "Bu siparişe erişim yetkiniz yok." })
    return
  }

  const trackings = await service.listShipmentTrackings(
    { order_id: orderId },
    { order: { created_at: "DESC" } }
  )

  if (!trackings.length) {
    res.json({ trackings: [], message: "Bu sipariş için henüz kargo bilgisi girilmedi." })
    return
  }

  res.json({ trackings })
}
