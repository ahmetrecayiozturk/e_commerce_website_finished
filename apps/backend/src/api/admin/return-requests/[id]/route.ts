import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../modules/return-requests/service"
import { revalidateStorefrontOrders } from "../../../../utils/revalidate-storefront"
import { requireAdmin, requireId, requireText } from "../../../../utils/auth"

type UpdateReturnRequestBody = {
  status: "approved" | "rejected" | "refunded"
  admin_note?: string
}

// POST /admin/return-requests/:id -> durumunu günceller (onayla / reddet / iade edildi olarak işaretle)
export async function POST(
  req: MedusaRequest<UpdateReturnRequestBody>,
  res: MedusaResponse
): Promise<void> {
  requireAdmin(req)
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const id = requireId(req.params.id)
  const { status, admin_note } = req.body

  if (!["approved", "rejected", "refunded"].includes(status)) {
    res.status(400).json({ message: "Geçersiz status değeri." })
    return
  }

  const request = await service.updateReturnRequests({
    id,
    status: status as any,
    admin_note: admin_note ? requireText(admin_note, "admin_note", 2000) : undefined,
  } as any)

  await revalidateStorefrontOrders()

  res.json({ return_request: request })
}
