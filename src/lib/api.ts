const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    
    if (!res.ok) {
      let errorMessage = `API error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    // Status 204 (No Content) não tem body - retornar null
    if (res.status === 204) {
      return null as T;
    }
    
    // Verificar se há conteúdo antes de tentar fazer parse
    const contentType = res.headers.get('content-type');
    const text = await res.text();
    
    // Se não houver texto, retornar null
    if (!text || text.trim() === '') {
      return null as T;
    }
    
    // Se o content-type indicar JSON ou se conseguir fazer parse, retornar JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return JSON.parse(text) as T;
      } catch {
        // Se falhar o parse, retornar null
        return null as T;
      }
    }
    
    // Tentar fazer parse mesmo sem content-type JSON (pode ser que funcione)
    try {
      return JSON.parse(text) as T;
    } catch {
      // Se não for JSON válido, retornar como texto
      return text as T;
    }
  } catch (error) {
    console.error('[API] Erro na requisição:', error);
    throw error;
  }
}


