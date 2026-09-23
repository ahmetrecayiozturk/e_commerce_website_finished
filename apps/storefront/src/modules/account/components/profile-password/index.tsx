"use client"

import React from "react"
import { useActionState } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    { success: false, error: null }
  )

  return (
    <form
      action={formAction}
      className="w-full"
    >
      <AccountInfo
        label="Şifre"
        currentInfo={
          <span>Şifre güvenlik nedeniyle gösterilmez</span>
        }
        isSuccess={state.success}
        isError={Boolean(state.error)}
        errorMessage={state.error ?? undefined}
        clearState={() => undefined}
        data-testid="account-password-editor"
      >
        <input type="hidden" name="email" value={customer.email} />
        <p className="text-small-regular text-ui-fg-subtle">
          Şifrenizi değiştirmek için e-posta adresinize güvenli bir yenileme
          bağlantısı gönderilir.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 rounded-rounded bg-ui-fg-base px-4 py-2 text-ui-fg-on-color disabled:opacity-50"
        >
          {isPending ? "Gönderiliyor..." : "Şifre yenileme bağlantısı gönder"}
        </button>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
