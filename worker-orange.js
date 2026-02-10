const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://corretor36.pages.dev',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // 1. Trata preflight (OPTIONS) - Necessário para permitir o método PUT
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    try {
      // Operação de UPLOAD (PUT)
      if (request.method === 'PUT') {
        if (!key) {
          return new Response('Key required', { status: 400, headers: CORS_HEADERS });
        }

        await env.IMOVEIS_BUCKET.put(key, request.body, {
          httpMetadata: {
            contentType: request.headers.get('Content-Type') || 'image/jpeg',
          },
        });

        const finalUrl = `https://orange.corretorprime36.workers.dev/${key}`;
        
        return new Response(JSON.stringify({ url: finalUrl, ok: true }), {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
          },
        });
      }

      // Operação de LEITURA (GET)
      if (request.method === 'GET') {
        if (!key) {
          return new Response('Key required', { status: 400, headers: CORS_HEADERS });
        }

        const object = await env.IMOVEIS_BUCKET.get(key);
        if (!object) {
          return new Response('Not found', { status: 404, headers: CORS_HEADERS });
        }

        const responseHeaders = new Headers(CORS_HEADERS);
        object.writeHttpMetadata(responseHeaders);
        responseHeaders.set('etag', object.httpEtag);
        
        // Garante que o Content-Type seja devolvido corretamente para exibição
        if (!responseHeaders.has('Content-Type')) {
          responseHeaders.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
        }

        return new Response(object.body, { 
          headers: responseHeaders 
        });
      }

      // Caso tente outros métodos
      return new Response('Method Not Allowed', {
        status: 405,
        headers: CORS_HEADERS,
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      });
    }
  }
};