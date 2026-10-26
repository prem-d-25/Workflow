import axios from "axios"

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles FastAPI's standard {"detail": "..."} format as well as validation errors.
 */
export function getErrorMessage(error: unknown, fallbackMessage = "An unexpected error occurred."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data) {
      if (typeof data.detail === "string") {
        return data.detail
      }
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        return (
          data.detail
            .map((item: { msg?: string }) => item.msg)
            .filter(Boolean)
            .join(", ") || fallbackMessage
        )
      }
      if (typeof data.message === "string") {
        return data.message
      }
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallbackMessage
}
