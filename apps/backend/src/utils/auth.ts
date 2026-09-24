import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

type AuthContext = {
  actor_id?: string
  actor_type?: string
}

function getAuthContext(req: MedusaRequest): AuthContext | undefined {
  return (req as MedusaRequest & { auth_context?: AuthContext }).auth_context
}

export function requireCustomer(req: MedusaRequest): string {
  const auth = getAuthContext(req)

  if (!auth?.actor_id || auth.actor_type !== "customer") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Müşteri kimlik doğrulaması gereklidir."
    )
  }

  return auth.actor_id
}

export function requireAdmin(req: MedusaRequest): string {
  const auth = getAuthContext(req)

  if (!auth?.actor_id || auth.actor_type !== "user") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Yönetici kimlik doğrulaması gereklidir."
    )
  }

  return auth.actor_id
}

export function requireId(value: string | undefined, name = "id"): string {
  if (!value || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Geçersiz ${name}.`)
  }

  return value
}

export function requireText(
  value: unknown,
  name: string,
  maxLength = 2000
): string {
  if (typeof value !== "string") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} zorunludur.`
    )
  }

  const text = value.trim()
  if (!text || text.length > maxLength) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} geçersizdir.`
    )
  }

  return text
}

export function unauthorized(
  res: MedusaResponse,
  message = "Kimlik doğrulaması gereklidir."
): boolean {
  res.status(401).json({ message })
  return false
}
