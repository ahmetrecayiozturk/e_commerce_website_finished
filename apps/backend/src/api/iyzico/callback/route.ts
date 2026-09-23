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

  const storefrontUrl = process.env.STOREFRONT_URL

  if (!storefrontUrl) {
    res.status(500).json({ message: "STOREFRONT_URL yapılandırılmalıdır." })
    return
  }

  if (!token) {
    res.redirect(`${storefrontUrl}/checkout?error=missing_token`)
    return
  }

  const redirectUrl = new URL(
    "/tr/checkout/iyzico-result",
    storefrontUrl.endsWith("/") ? storefrontUrl : `${storefrontUrl}/`
  )
  redirectUrl.searchParams.set("token", token)
  res.redirect(redirectUrl.toString())
}
