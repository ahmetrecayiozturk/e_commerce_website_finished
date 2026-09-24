import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { requireAdmin } from "../../../utils/auth"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  requireAdmin(req)
  res.sendStatus(200);
}
