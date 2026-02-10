const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://corretor36.pages.dev",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // 1. Trata preflight CORS (Obrigatório para PUT/DELETE)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key && request.method !== "GET") {
      return new Response("Key required", { status: 400, headers: CORS_HEADERS });
    }

    try {
      // UPLOAD (PUT)
      if (request.method === "PUT") {
        await env.IMOVEIS_BUCKET.put(key, request.body, {
          httpMetadata: { contentType: request.headers.get("Content-Type") || "image/jpeg" }
        });
        const finalUrl = `https://orange.corretorprime36.workers.dev/${key}`;
        return new Response(JSON.stringify({ url: finalUrl }), { 
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
        });
      }

      // DOWNLOAD (GET)
      if (request.method === "GET") {
        const object = await env.IMOVEIS_BUCKET.get(key);
        if (!object) {
          return new Response("Not found", { status: 404, headers: CORS_HEADERS });
        }

        const headers = new Headers(CORS_HEADERS);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        return new Response(object.body, { headers });
      }

      // REMOVER (DELETE)
      if (request.method === "DELETE") {
        await env.IMOVEIS_BUCKET.delete(key);
        return new Response("Deleted", { headers: CORS_HEADERS });
      }

      return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });

    } catch (err) {
      return new Response("Internal Server Error: " + err.message, { 
        status: 500, 
        headers: CORS_HEADERS 
      });
    }
  }
};