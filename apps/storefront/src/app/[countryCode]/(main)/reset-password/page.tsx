import ResetPassword from "@modules/account/components/reset-password"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="content-container py-12">
        <p className="text-small-regular">
          Şifre yenileme bağlantısı geçersiz veya eksik.
        </p>
      </div>
    )
  }

  return (
    <div className="content-container py-12">
      <ResetPassword token={token} />
    </div>
  )
}
