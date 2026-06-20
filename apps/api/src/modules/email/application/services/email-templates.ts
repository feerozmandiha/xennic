export function renderPasswordResetEmail(recipientName: string, resetLink: string, language: 'fa' | 'en' = 'fa'): { subject: string; html: string } {
  const isFa = language === 'fa';
  const subject = isFa ? 'بازیابی رمز عبور - Xennic' : 'Password Reset - Xennic';

  const html = `<!DOCTYPE html>
<html dir="${isFa ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"></head>
<body style="font-family: Tahoma, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 24px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">${isFa ? 'Xennic' : 'Xennic'}</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">${isFa ? 'پلتفرم مهندسی برق' : 'Electrical Engineering Platform'}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px;">
          ${isFa ? `سلام ${recipientName} عزیز،` : `Hello ${recipientName},`}
        </p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
          ${isFa
            ? 'درخواست بازیابی رمز عبور برای حساب شما ثبت شده است. برای تنظیم رمز جدید روی دکمه زیر کلیک کنید:'
            : 'A password reset was requested for your account. Click the button below to set a new password:'}
        </p>
        <table style="margin: 0 auto 24px;">
          <tr>
            <td style="background: #2563eb; border-radius: 8px; padding: 12px 32px;">
              <a href="${resetLink}" style="color: #fff; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                ${isFa ? 'بازیابی رمز عبور' : 'Reset Password'}
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px;">
          ${isFa ? 'این لینک تا ۱۵ دقیقه معتبر است.' : 'This link expires in 15 minutes.'}
        </p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">
          ${isFa
            ? 'اگر درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید.'
            : 'If you did not request a password reset, please ignore this email.'}
        </p>
      </td>
    </tr>
    <tr>
      <td style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          ${isFa ? '© ۲۰۲۶ Xennic. تمام حقوق محفوظ است.' : '© 2026 Xennic. All rights reserved.'}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export function renderWelcomeEmail(recipientName: string, loginLink: string, language: 'fa' | 'en' = 'fa'): { subject: string; html: string } {
  const isFa = language === 'fa';
  const subject = isFa ? 'به Xennic خوش آمدید!' : 'Welcome to Xennic!';

  const html = `<!DOCTYPE html>
<html dir="${isFa ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"></head>
<body style="font-family: Tahoma, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 24px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">${isFa ? 'خوش آمدید' : 'Welcome'}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px;">
          ${isFa ? `سلام ${recipientName} عزیز،` : `Hello ${recipientName},`}
        </p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
          ${isFa
            ? 'حساب کاربری شما در Xennic با موفقیت ایجاد شد. اکنون می‌توانید از تمام قابلیت‌های پلتفرم مهندسی برق استفاده کنید.'
            : 'Your Xennic account has been created successfully. You can now use all features of the electrical engineering platform.'}
        </p>
        <table style="margin: 0 auto 24px;">
          <tr>
            <td style="background: #2563eb; border-radius: 8px; padding: 12px 32px;">
              <a href="${loginLink}" style="color: #fff; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                ${isFa ? 'ورود به Xennic' : 'Login to Xennic'}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          ${isFa ? '© ۲۰۲۶ Xennic. تمام حقوق محفوظ است.' : '© 2026 Xennic. All rights reserved.'}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export function renderWorkspaceInviteEmail(
  recipientName: string,
  inviterName: string,
  workspaceName: string,
  acceptLink: string,
  language: 'fa' | 'en' = 'fa',
): { subject: string; html: string } {
  const isFa = language === 'fa';
  const subject = isFa
    ? `دعوت به ${workspaceName} - Xennic`
    : `Invitation to ${workspaceName} - Xennic`;

  const html = `<!DOCTYPE html>
<html dir="${isFa ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"></head>
<body style="font-family: Tahoma, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 24px;">
  <table style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">${isFa ? 'دعوت به همکاری' : 'Invitation'}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 16px; color: #1f2937; margin: 0 0 16px;">
          ${isFa ? `سلام ${recipientName} عزیز،` : `Hello ${recipientName},`}
        </p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
          ${isFa
            ? `${inviterName} شما را به workspace "${workspaceName}" دعوت کرده است.`
            : `${inviterName} has invited you to the workspace "${workspaceName}".`}
        </p>
        <table style="margin: 0 auto 24px;">
          <tr>
            <td style="background: #2563eb; border-radius: 8px; padding: 12px 32px;">
              <a href="${acceptLink}" style="color: #fff; text-decoration: none; font-size: 16px; font-weight: bold; display: block;">
                ${isFa ? 'پذیرفتن دعوت' : 'Accept Invitation'}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          ${isFa ? '© ۲۰۲۶ Xennic. تمام حقوق محفوظ است.' : '© 2026 Xennic. All rights reserved.'}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
