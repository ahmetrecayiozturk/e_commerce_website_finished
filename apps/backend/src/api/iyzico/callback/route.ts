import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

// iyzico, Checkout Form ödemesi tamamlandığında bu adrese
// application/x-www-form-urlencoded POST isteği ile "token" gönderir.
// Biz bu token'ı storefront'un ödeme sonucu sayfasına query param
// olarak iletip yönlendiriyoruz. Storefront orada
// cart'ı "complete" ederek (authorizePayment tetiklenir) siparişi tamamlar.
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const token = (req.body as any)?.token

  const storefrontUrl =
    process.env.STOREFRONT_URL || "http://localhost:8000"

  if (!token) {
    res.redirect(`${storefrontUrl}/checkout?error=missing_token`)
    return
  }

  res.redirect(`${storefrontUrl}/tr/checkout/iyzico-result?token=${token}`)
}
