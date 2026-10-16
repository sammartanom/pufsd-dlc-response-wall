const MAX_LENGTH = 700;
const MIN_LENGTH = 3;
const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|edu|gov)\b)/i;
const BLOCKED = [
  // Add district-approved blocked terms here if desired.
];

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function clean(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validate(text) {
  if (text.length < MIN_LENGTH) return "Please complete each sentence starter.";
  if (text.length > MAX_LENGTH) return `Each response must be ${MAX_LENGTH} characters or fewer.`;
  if (URL_PATTERN.test(text)) return "Links and web addresses are not permitted.";
  const lowered = text.toLowerCase();
  if (BLOCKED.some((term) => lowered.includes(term))) return "Please revise the response before submitting.";
  return null;
}

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      `SELECT id, response_1, response_2, response_3, created_at
       FROM responses
       ORDER BY datetime(created_at) DESC, id DESC
       LIMIT 250`
    ).all();
    return json({ responses: result.results ?? [] });
  } catch (error) {
    console.error(error);
    return json({ error: "Responses could not be loaded." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ error: "Request must be JSON." }, 415);
    }

    const body = await request.json();
    if (body.website) return json({ ok: true }, 201); // Honeypot

    const responses = [
      clean(body.response1),
      clean(body.response2),
      clean(body.response3),
    ];

    for (const text of responses) {
      const issue = validate(text);
      if (issue) return json({ error: issue }, 400);
    }

    const createdAt = new Date().toISOString();
    const saved = await env.DB.prepare(
      `INSERT INTO responses (response_1, response_2, response_3, created_at)
       VALUES (?, ?, ?, ?)
       RETURNING id, response_1, response_2, response_3, created_at`
    ).bind(...responses, createdAt).first();

    return json({ response: saved }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "The response could not be submitted." }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { allow: "GET, POST, OPTIONS" } });
}
