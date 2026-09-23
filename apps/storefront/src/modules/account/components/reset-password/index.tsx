"use client"

import { updatePasswordWithToken } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

export default function ResetPassword({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    updatePasswordWithToken,
    { success: false, error: null }
  )

  return (
    <form action={formAction} className="mx-auto flex max-w-md flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <h1 className="text-2xl-semi">Şifreni yenile</h1>
      <p className="text-small-regular text-ui-fg-subtle">
        Yeni şifreni belirle ve hesabına tekrar giriş yap.
      </p>
      <Input
        label="Yeni şifre"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <Input
        label="Yeni şifre tekrar"
        name="confirmation"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.error && (
        <p className="text-small-regular text-ui-fg-error">{state.error}</p>
      )}
      {state.success && (
        <p className="text-small-regular text-ui-fg-success">
          Şifren güncellendi. Giriş sayfasından devam edebilirsin.
        </p>
      )}
      {!state.success && (
        <button
          type="submit"
          disabled={isPending}
          className="rounded-rounded bg-ui-fg-base px-4 py-2 text-ui-fg-on-color disabled:opacity-50"
        >
          {isPending ? "Güncelleniyor..." : "Şifreyi güncelle"}
        </button>
      )}
    </form>
  )
}
