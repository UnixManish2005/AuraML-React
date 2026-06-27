// ============================================================
// EMAIL TEMPLATES
// ============================================================

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AuraML";
const appUrl  = process.env.NEXT_PUBLIC_APP_URL  ?? "http://localhost:3000";

// Shared wrapper so all emails look consistent
function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                ${appName}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reusable credential box
function credentialBox(email: string, password: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:8px;margin:20px 0;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
          Your Login Credentials
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
          <tr>
            <td width="90" style="font-size:14px;color:#6b7280;padding:6px 0;">Email</td>
            <td style="font-size:14px;color:#111827;font-weight:600;padding:6px 0;">${email}</td>
          </tr>
          <tr>
            <td width="90" style="font-size:14px;color:#6b7280;padding:6px 0;">Password</td>
            <td style="font-size:14px;color:#111827;font-weight:600;font-family:monospace;padding:6px 0;">${password}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// CTA button
function ctaButton(label: string, href: string) {
  return `
  <div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}"
       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
              color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;
              letter-spacing:0.2px;">
      ${label}
    </a>
  </div>`;
}

// ── 1. Self-registration welcome email ─────────────────────────────────────
export function studentSelfRegisterEmail(name: string, email: string, password: string) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Welcome to ${appName}, ${name}! 🎉
    </h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
      Your account has been created successfully. You're all set to start learning!
    </p>

    ${credentialBox(email, password)}

    <p style="margin:16px 0;color:#6b7280;font-size:14px;line-height:1.6;">
      Use the credentials above to log in to your student dashboard where you can browse
      courses, track your progress, and connect with trainers.
    </p>

    ${ctaButton("Go to My Dashboard", `${appUrl}/auth/login`)}

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      💡 <strong>Tip:</strong> You can change your password anytime from your profile settings.
    </p>`;

  return {
    subject: `Welcome to ${appName} — Your account is ready!`,
    html: layout(content),
  };
}

// ── 2. Admin-created student account ───────────────────────────────────────
export function adminCreatedStudentEmail(name: string, email: string, password: string) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      You've been enrolled in ${appName}! 📚
    </h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
      Hi <strong>${name}</strong>, an account has been created for you on
      <strong>${appName}</strong>. You can now log in and start exploring your courses.
    </p>

    ${credentialBox(email, password)}

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:16px 0;">
      <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
        ⚠️ <strong>Important:</strong> Please change your password after your first login
        for security. Go to <em>Profile → Change Password</em>.
      </p>
    </div>

    ${ctaButton("Log In Now", `${appUrl}/auth/login`)}

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      If you have any questions, please contact your program coordinator.
    </p>`;

  return {
    subject: `Your ${appName} student account is ready`,
    html: layout(content),
  };
}

// ── 3. Admin-created trainer account ───────────────────────────────────────
export function adminCreatedTrainerEmail(name: string, email: string, password: string) {
  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Welcome aboard, ${name}! 🏆
    </h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
      You've been added as a <strong>Trainer</strong> on <strong>${appName}</strong>.
      Your trainer dashboard is ready — you can manage batches, track student progress,
      and deliver sessions all from one place.
    </p>

    ${credentialBox(email, password)}

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 18px;margin:16px 0;">
      <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.5;">
        🔐 <strong>Action required:</strong> You must change your password on first login.
        You'll be prompted automatically after signing in.
      </p>
    </div>

    ${ctaButton("Access Trainer Dashboard", `${appUrl}/auth/login`)}

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      Need help getting started? Reach out to the platform admin.
    </p>`;

  return {
    subject: `You're now a Trainer on ${appName} — Here are your login details`,
    html: layout(content),
  };
}