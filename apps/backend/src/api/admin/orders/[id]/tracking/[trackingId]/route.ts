import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../../modules/shipment-tracking/service"
import { revalidateStorefrontOrders } from "../../../../../../utils/revalidate-storefront"
import { requireAdmin, requireId, requireText } from "../../../../../../utils/auth"

type UpdateStatusBody = {
  status:
    | "preparing"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
  note?: string
}

// POST /admin/orders/:id/tracking/:trackingId -> durum günceller,
// geçmişe yeni bir kayıt ekler (örn. "Dağıtıma çıktı")
export async function POST(
  req: MedusaRequest<UpdateStatusBody>,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const trackingId = requireId(req.params.trackingId, "trackingId")
  const { status, note } = req.body

  const validStatuses = [
    "preparing",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "failed",
  ]
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Geçersiz status değeri." })
    return
  }
  const tracking = await service.addStatusUpdate(
    trackingId,
    status,
    note ? requireText(note, "note", 500) : undefined
  )

  await revalidateStorefrontOrders()

  res.json({ tracking })
}
