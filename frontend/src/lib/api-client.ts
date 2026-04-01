import { authStore } from "@/lib/auth";
import type { AppError } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authStore.getToken();
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await res.json() : await res.text();
    throw normalizeError(res.status, body);
  }
  return (await res.json()) as T;
}

function normalizeError(status: number, body: unknown): AppError {
  const messages: string[] = [];
  const fields: { field: string; message: string }[] = [];

  if (typeof body === "string") {
    messages.push(body || "Request failed");
  } else if (body && typeof body === "object") {
    const maybe = body as { detail?: unknown };
    if (Array.isArray(maybe.detail)) {
      for (const item of maybe.detail) {
        const entry = item as { msg?: string; loc?: Array<string | number> };
        const msg = entry.msg || "Validation error";
        messages.push(msg);
        if (entry.loc && entry.loc.length > 1) {
          fields.push({
            field: String(entry.loc[entry.loc.length - 1]),
            message: msg
          });
        }
      }
    } else if (typeof maybe.detail === "string") {
      messages.push(maybe.detail);
    } else {
      messages.push("Request failed");
    }
  } else {
    messages.push("Request failed");
  }

  const err = new Error(messages[0]) as AppError;
  err.status = status;
  err.messages = messages;
  err.fields = fields;
  err.raw = body;
  return err;
}
