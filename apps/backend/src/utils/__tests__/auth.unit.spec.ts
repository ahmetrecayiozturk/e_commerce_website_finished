import {
  requireAdmin,
  requireCustomer,
  requireId,
  requireText,
} from "../auth"

describe("auth helpers", () => {
  it("accepts an authenticated customer", () => {
    const request = {
      auth_context: {
        actor_id: "cus_123",
        actor_type: "customer",
      },
    }

    expect(requireCustomer(request as never)).toBe("cus_123")
  })

  it("rejects a non-customer actor", () => {
    const request = {
      auth_context: {
        actor_id: "user_123",
        actor_type: "user",
      },
    }

    expect(() => requireCustomer(request as never)).toThrow(
      "Müşteri kimlik doğrulaması gereklidir."
    )
  })

  it("accepts an authenticated admin", () => {
    const request = {
      auth_context: {
        actor_id: "user_123",
        actor_type: "user",
      },
    }

    expect(requireAdmin(request as never)).toBe("user_123")
  })

  it("validates ids and text input", () => {
    expect(requireId("order_123", "sipariş")).toBe("order_123")
    expect(requireText("  konu  ", "Konu")).toBe("konu")
    expect(() => requireId("../secret")).toThrow("Geçersiz id.")
    expect(() => requireText("   ", "Konu")).toThrow("Konu geçersizdir.")
  })
})
