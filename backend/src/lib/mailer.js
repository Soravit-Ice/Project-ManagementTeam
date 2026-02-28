import Mailjet from 'node-mailjet';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

let mailjetClient;

export function getTransporter() {
  if (mailjetClient) return mailjetClient;

  mailjetClient = Mailjet.apiConnect(env.SMTP_USER, env.SMTP_PASS);

  return mailjetClient;
}

export async function sendMail({ to, subject, html, text }) {
  const mj = getTransporter();

  // Parse MAIL_FROM which might look like "Project Management Team <teedevofficial@gmail.com>"
  let fromEmail = env.MAIL_FROM;
  let fromName = 'Project Management Team';

  if (env.MAIL_FROM) {
    const fromMatch = env.MAIL_FROM.match(/^(.*?)?\s*<(.*?)>$/);
    if (fromMatch) {
      fromName = fromMatch[1].trim() || 'Project Management Team';
      fromEmail = fromMatch[2].trim();
    }
  }

  try {
    const request = await mj
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName
            },
            To: [
              {
                Email: to,
                Name: to
              }
            ],
            Subject: subject,
            TextPart: text,
            HTMLPart: html
          }
        ]
      });

    return request.body;
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${to}:`, error.message || error);
    throw new AppError('ระบบไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง (Mailjet API Error)', {
      status: 503,
      code: 'EMAIL_SEND_FAILED'
    });
  }
}
