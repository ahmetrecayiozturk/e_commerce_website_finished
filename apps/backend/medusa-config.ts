import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/reviews",
    },
    {
      resolve: "./src/modules/return-requests",
    },
    {
      resolve: "./src/modules/support-tickets",
    },
    {
      resolve: "./src/modules/shipment-tracking",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-iyzico",
            id: "iyzico",
            options: {
              api_key: process.env.IYZICO_API_KEY,
              secret_key: process.env.IYZICO_SECRET_KEY,
              base_url: process.env.IYZICO_BASE_URL,
            },
          },
        ],
      },
    },
  ],
})