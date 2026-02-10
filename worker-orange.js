const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://corretor36.pages.dev",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // 1. Tratamento obrigatório do Preflight (OPTIONS)
    // O navegador envia esta requisição antes do PUT para verificar permissões de CORS.
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    try {
      // Operação de UPLOAD (PUT)
      if (request.method === "PUT") {
        // Salva o corpo da requisição diretamente no bucket R2
        await env.IMOVEIS_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get("Content-Type") || "image/jpeg",
          },
        });
        
        // Retorna JSON com a URL para que o frontend possa persistir o caminho no banco de dados.
        // Usamos JSON porque o frontend executa response.json() após o upload.
        const finalUrl = `https://orange.corretorprime36.workers.dev/${key}`;
        return new Response(JSON.stringify({ url: finalUrl }), { 
          headers: { 
            ...CORS_HEADERS, 
            "Content-Type": "application/json" 
          } 
        });
      }

      // Operação de LEITURA (GET)
      if (request.method === "GET") {
        const object = await env.IMOVEIS_BUCKET.get(key);
        if (!object) {
          return new Response("Not found", { status: 404, headers: CORS_HEADERS });
        }

        const headers = new Headers(CORS_HEADERS);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        
        // Garante que o Content-Type seja devolvido corretamente para exibição da imagem
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
        }

        return new Response(object.body, { headers });
      }

      // Operação de EXCLUSÃO (DELETE)
      if (request.method === "DELETE") {
        await env.IMOVEIS_BUCKET.delete(key);
        return new Response("Deleted", { headers: CORS_HEADERS });
      }

      // Método não permitido
      return new Response("Method not allowed", {
        status: 405,
        headers: CORS_HEADERS,
      });

    } catch (err) {
      return new Response("Internal Server Error: " + err.message, {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }
};