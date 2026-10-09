// Cloudflare Worker: serves the static site and handles the contact form.
// Form submissions are emailed to Deborah through Cloudflare Email Routing.
import { EmailMessage } from "cloudflare:email";

const FROM_ADDRESS = "hello@deborahmadnicktherapy.com";
const FROM_NAME = "Website Contact Form";
const TO_ADDRESS = "dmadnickpsyd@gmail.com"; // must be a verified Email Routing destination

const LIMITS = { name: 200, email: 254, phone: 40, preferred_contact: 40, message: 5000 };
const PREFERRED = ["Email", "Phone call", "Text message"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Send www visitors to the main address so search engines see one site.
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  const reply = (ok, message, status) =>
    wantsJson
      ? Response.json({ success: ok, message }, { status })
      : ok
        ? Response.redirect(new URL("/thank-you", request.url).toString(), 303)
        : new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  let data;
  try {
    data = await readBody(request);
  } catch {
    return reply(false, "Could not read the form.", 400);
  }

  // Spam trap: real visitors never tick the hidden "botcheck" box.
  if (data.botcheck) return reply(true, "ok", 200);

  const fields = {};
  for (const key of Object.keys(LIMITS)) {
    fields[key] = String(data[key] ?? "").trim().slice(0, LIMITS[key]);
  }
  if (!fields.name || !fields.email || !fields.message) {
    return reply(false, "Please fill in your name, email, and message.", 400);
  }
  if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(fields.email)) {
    return reply(false, "Please enter a valid email address.", 400);
  }
  if (!PREFERRED.includes(fields.preferred_contact)) fields.preferred_contact = "Email";

  const body = [
    "New message from deborahmadnicktherapy.com",
    "",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || "(not provided)"}`,
    `Preferred contact: ${fields.preferred_contact}`,
    "",
    "Message:",
    fields.message,
    "",
    "—",
    "Reply to this email to respond directly to the sender.",
  ].join("\n");

  const raw = buildMime({
    from: { name: FROM_NAME, email: FROM_ADDRESS },
    to: TO_ADDRESS,
    replyTo: { name: fields.name, email: fields.email },
    subject: `New inquiry from ${fields.name}`,
    text: body,
  });

  try {
    await env.EMAIL.send(new EmailMessage(FROM_ADDRESS, TO_ADDRESS, raw));
  } catch (err) {
    console.error("Email send failed:", err && (err.code || ""), err && err.message);
    return reply(false, "Sorry, the message could not be sent.", 502);
  }
  return reply(true, "ok", 200);
}

async function readBody(request) {
  const type = request.headers.get("Content-Type") || "";
  if (type.includes("application/json")) return await request.json();
  return Object.fromEntries(await request.formData());
}

// ---- Minimal, header-injection-safe MIME builder ----

function clean(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function encodeWord(text) {
  const t = clean(text);
  return /^[\x20-\x7E]*$/.test(t) ? t : `=?UTF-8?B?${toBase64(t)}?=`;
}

function formatAddress({ name, email }) {
  const plain = clean(name).replace(/["\\]/g, "");
  if (!plain) return `<${clean(email)}>`;
  // Non-ASCII names are sent as an encoded word, which must not be quoted.
  return /^[\x20-\x7E]*$/.test(plain) ? `"${plain}" <${clean(email)}>` : `${encodeWord(plain)} <${clean(email)}>`;
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function buildMime({ from, to, replyTo, subject, text }) {
  const domain = from.email.split("@")[1];
  const body = toBase64(text).replace(/.{1,76}/g, "$&\r\n");
  return [
    `From: ${formatAddress(from)}`,
    `To: <${clean(to)}>`,
    `Reply-To: ${formatAddress(replyTo)}`,
    `Subject: ${encodeWord(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");
}
