import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../modules/shipment-tracking/service"
import { revalidateStorefrontOrders } from "../../../../../utils/revalidate-storefront"
import { requireAdmin, requireId, requireText } from "../../../../../utils/auth"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const orderId = requireId(req.params.id, "order_id")

  const trackings = await service.listShipmentTrackings(
    { order_id: orderId },
    { order: { created_at: "DESC" } }
  )

  res.json({ trackings })
}

type CreateTrackingBody = {
  fulfillment_id?: string
  carrier: string
  carrier_name?: string
  tracking_number: string
}

export async function POST(
  req: MedusaRequest<CreateTrackingBody>,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const orderId = requireId(req.params.id, "order_id")
  const { fulfillment_id, carrier, carrier_name, tracking_number } = req.body

  const validCarriers = ["yurtici", "aras", "mng", "ptt", "surat", "ups", "other"]
  if (!validCarriers.includes(carrier)) {
    res.status(400).json({ message: "Geçersiz carrier değeri." })
    return
  }
  const validTrackingNumber = requireText(tracking_number, "tracking_number", 200)

  const tracking_url = await service.buildTrackingUrl(carrier, validTrackingNumber)

  const tracking = await service.createShipmentTrackings({
    order_id: orderId,
    fulfillment_id,
    carrier: carrier as any,
    carrier_name,
    tracking_number: validTrackingNumber,
    tracking_url,
    status: "shipped",
    status_history: [
      {
        status: "shipped",
        note: "Kargoya verildi",
        created_at: new Date().toISOString(),
      },
    ] as any,
  } as any)
  await revalidateStorefrontOrders()
    
  res.status(201).json({ tracking })
}