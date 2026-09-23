"use client"

import { placeOrder } from "@lib/data/cart"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function IyzicoResultPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setError("Ödeme doğrulama bilgisi bulunamadı.")
      setLoading(false)
      return
    }

    placeOrder()
      .catch((err: unknown) => {
        // Next.js'in kendi yönlendirme mekanizması, client tarafında
        // otomatik olarak ele alınır; burada sadece gerçek hataları yakalıyoruz.
        if (
          typeof err === "object" &&
          err !== null &&
          "digest" in err &&
          typeof err.digest === "string" &&
          err.digest.startsWith("NEXT_REDIRECT")
        ) {
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [searchParams])

  if (loading) {
    return (
      <div className="content-container py-24 text-center">
        <h1 className="text-2xl-semi mb-4">Ödemeniz işleniyor...</h1>
        <p className="text-ui-fg-subtle">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-container py-24 text-center">
        <h1 className="text-2xl-semi mb-4">Ödeme tamamlanamadı</h1>
        <p className="text-ui-fg-subtle mb-6">{error}</p>
        <a href="../checkout" className="text-ui-fg-interactive underline">
          Tekrar deneyin
        </a>
      </div>
    )
  }

  return null
}