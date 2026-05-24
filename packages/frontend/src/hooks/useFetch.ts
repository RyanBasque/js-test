import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../services/api";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchReturn<T> extends FetchState<T> {
  execute: (path: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/** Traduz erros técnicos em mensagens legíveis */
function friendlyError(err: unknown): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Unexpected token") || msg.includes("is not valid JSON")) {
    return "O servidor retornou uma resposta inesperada. Tente novamente.";
  }
  if (msg.includes("NetworkError") || msg.includes("network")) {
    return "Erro de rede. Verifique sua conexão e tente novamente.";
  }
  if (msg.includes("timeout") || msg.includes("AbortError")) {
    return "A requisição demorou demais. Tente novamente.";
  }
  return msg || "Ocorreu um erro inesperado.";
}

export function useFetch<T = unknown>(): UseFetchReturn<T> {
  const { token } = useAuth();
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (path: string, options: RequestInit = {}): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const isFormData = options.body instanceof FormData;
        const headers: HeadersInit = {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        };

        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        // Check if response is JSON before parsing
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          const errorMsg =
            res.status === 404
              ? "Recurso não encontrado."
              : res.status >= 500
                ? "Erro interno do servidor. Tente novamente mais tarde."
                : "O servidor retornou uma resposta inesperada.";
          setState({ data: null, loading: false, error: errorMsg });
          return null;
        }

        const json = (await res.json()) as {
          status: string;
          message: string;
          data: T;
        };

        if (!res.ok) {
          setState({
            data: null,
            loading: false,
            error: json.message ?? "Erro ao processar requisição.",
          });
          return null;
        }

        setState({ data: json.data, loading: false, error: null });
        return json.data;
      } catch (err) {
        setState({ data: null, loading: false, error: friendlyError(err) });
        return null;
      }
    },
    [token]
  );

  const reset = useCallback(
    () => setState({ data: null, loading: false, error: null }),
    []
  );

  return { ...state, execute, reset };
}
