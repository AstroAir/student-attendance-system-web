import { matchRoute, mockHandlers } from "./handlers"

const API_PREFIX = "/api/v1"

let mockEnabled = false
let originalFetch: typeof fetch | null = null

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function handleMockRequest(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString()
  const method = init?.method?.toUpperCase() || "GET"

  const urlObj = new URL(url, "http://localhost")
  let pathname = urlObj.pathname

  if (pathname.startsWith(API_PREFIX)) {
    pathname = pathname.slice(API_PREFIX.length)
  }

  const { handler, match } = matchRoute(method, pathname)

  if (!match) {
    console.warn(`[Mock] No handler for ${method} ${pathname}`)
    return new Response(JSON.stringify({ code: 404, message: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  await delay(100 + Math.random() * 200)

  const handlerFn = mockHandlers[handler as keyof typeof mockHandlers]
  if (!handlerFn) {
    console.warn(`[Mock] Handler not implemented: ${handler}`)
    return new Response(JSON.stringify({ code: 501, message: "Not Implemented" }), {
      status: 501,
      headers: { "Content-Type": "application/json" },
    })
  }

  let body: unknown = undefined
  if (init?.body) {
    try {
      if (typeof init.body === "string") {
        body = JSON.parse(init.body)
      } else if (init.body instanceof FormData) {
        body = init.body
      }
    } catch {
      body = init.body
    }
  }

  try {
    const fullUrl = url.includes("?") ? url : `${url}${urlObj.search}`
    const result = (handlerFn as (url: string, body?: unknown) => unknown)(fullUrl, body)

    if (handler === "GET /data/export") {
      const exportResult = result as { format: "json" | "csv"; content: unknown }
      if (exportResult.format === "csv") {
        return new Response(exportResult.content as string, {
          status: 200,
          headers: { "Content-Type": "text/csv" },
        })
      }
      return new Response(JSON.stringify(exportResult.content), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = result as { code: number; message: string; data: unknown }

    if (response.code === 204) {
      return new Response(null, { status: 204 })
    }

    return new Response(JSON.stringify(response), {
      status: response.code >= 400 ? response.code : 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error(`[Mock] Error in handler ${handler}:`, err)
    return new Response(
      JSON.stringify({ code: 500, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export function enableMock(): void {
  if (mockEnabled) return

  originalFetch = globalThis.fetch

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString()

    if (
      url.includes("localhost:8080") ||
      url.includes("127.0.0.1:8080") ||
      url.startsWith(API_PREFIX)
    ) {
      console.log(`[Mock] Intercepting: ${init?.method || "GET"} ${url}`)
      return handleMockRequest(input, init)
    }

    return originalFetch!(input, init)
  }

  mockEnabled = true
  console.log("[Mock] Mock API enabled")
}

export function disableMock(): void {
  if (!mockEnabled || !originalFetch) return

  globalThis.fetch = originalFetch
  originalFetch = null
  mockEnabled = false
  console.log("[Mock] Mock API disabled")
}

export function isMockEnabled(): boolean {
  return mockEnabled
}

export { mockDb } from "./data"
