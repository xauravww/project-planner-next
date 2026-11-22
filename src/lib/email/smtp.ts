/**
 * Generic SMTP transport for transactional email — copied/adapted from the
 * LearnKit v2 sibling repo. Reads strict config from env without logging
 * credentials.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const SMTP_HOST_ENV = "SMTP_HOST";
const SMTP_PORT_ENV = "SMTP_PORT";
const SMTP_SECURE_ENV = "SMTP_SECURE";
const SMTP_REQUIRE_TLS_ENV = "SMTP_REQUIRE_TLS";
const SMTP_USER_ENV = "SMTP_USER";
const SMTP_PASSWORD_ENV = "SMTP_PASSWORD";
const SMTP_FROM_ENV = "SMTP_FROM";
const SMTP_PORT_MIN = 1;
const SMTP_PORT_MAX = 65535;
const SMTP_CONNECTION_TIMEOUT_MS = 10000;
const SMTP_GREETING_TIMEOUT_MS = 10000;
const SMTP_SOCKET_TIMEOUT_MS = 20000;

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user?: string;
  password?: string;
  from: string;
};

/** Reads strict SMTP configuration. Throws when absent or inconsistent. */
function readSmtpConfig(environment: Record<string, string | undefined> = process.env): SmtpConfig {
  const host = environment[SMTP_HOST_ENV]?.trim();
  const port = Number(environment[SMTP_PORT_ENV]);
  const secure = environment[SMTP_SECURE_ENV] === "true";
  const requireTls = environment[SMTP_REQUIRE_TLS_ENV] === "true";
  const user = environment[SMTP_USER_ENV]?.trim();
  const password = environment[SMTP_PASSWORD_ENV];
  const from = environment[SMTP_FROM_ENV]?.trim();

  if (!host || !from || !Number.isSafeInteger(port) || port < SMTP_PORT_MIN || port > SMTP_PORT_MAX) {
    throw new Error("SMTP_HOST, SMTP_PORT, and SMTP_FROM are required.");
  }
  if (Boolean(user) !== Boolean(password)) {
    throw new Error("SMTP_USER and SMTP_PASSWORD must be configured together.");
  }
  return { host, port, secure, requireTls, user, password, from };
}

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

/** Delivers one plain-text transactional email through the configured SMTP relay. */
export async function sendMail(message: MailMessage): Promise<void> {
  const config = readSmtpConfig();
  const transport: Transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTls,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    ...(config.user && config.password ? { auth: { user: config.user, pass: config.password } } : {}),
    tls: { minVersion: "TLSv1.2" },
  });
  try {
    await transport.sendMail({
      from: config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  } finally {
    transport.close();
  }
}
