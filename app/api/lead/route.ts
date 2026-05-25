import { NextResponse } from 'next/server';
import { google } from 'googleapis';

async function sendNotificationEmail(leadData: any) {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'mrhomesrealtors1@gmail.com';

  if (!apiKey) {
    console.warn('EMAIL_PROVIDER_API_KEY is not defined. Skipping email notification.');
    return;
  }

  const subject = `[New Lead] ${leadData.name} - ${leadData.intent.toUpperCase()}`;
  const html = `
    <h2>New Lead Received</h2>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: sans-serif;">
      <tr><td><strong>Name</strong></td><td>${leadData.name}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${leadData.phone}</td></tr>
      <tr><td><strong>Requirement Type</strong></td><td>${leadData.intent}</td></tr>
      <tr><td><strong>Property Type</strong></td><td>${leadData.type || 'Any'}</td></tr>
      <tr><td><strong>Area / Sector</strong></td><td>${leadData.area || 'Any'}</td></tr>
      <tr><td><strong>Budget</strong></td><td>${leadData.budget || 'Any'}</td></tr>
      <tr><td><strong>Move-in Timeline</strong></td><td>${leadData.timeline || 'Flexible'}</td></tr>
      <tr><td><strong>Additional Notes</strong></td><td>${leadData.notes || '-'}</td></tr>
      <tr><td><strong>Source</strong></td><td>${leadData.source}</td></tr>
      <tr><td><strong>Timestamp</strong></td><td>${leadData.timestamp}</td></tr>
    </table>
  `;

  // Check prefix to select provider API
  if (apiKey.startsWith('SG.')) {
    // SendGrid API
    console.log('Sending notification email via SendGrid...');
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: 'leads@mrhomesrealtors.com', name: 'Mr Homes Leads' },
        reply_to: { email: toEmail },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`SendGrid API failed: ${response.status} - ${errText}`);
    }
    console.log('SendGrid notification email sent successfully.');
  } else {
    // Default to Resend API
    console.log('Sending notification email via Resend...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Mr Homes Leads <onboarding@resend.dev>',
        to: toEmail,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API failed: ${response.status} - ${errText}`);
    }
    console.log('Resend notification email sent successfully.');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, intent, type, area, budget, timeline, notes, source, timestamp } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required.' }, { status: 400 });
    }

    // 1. Save to Google Sheets if credentials exist
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (sheetId && clientEmail && rawPrivateKey) {
      const privateKey = rawPrivateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:J',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              name,
              phone,
              intent || '',
              type || '',
              area || '',
              budget || '',
              timeline || '',
              notes || '',
              timestamp || new Date().toISOString(),
              source || 'general'
            ]
          ]
        }
      });
      console.log('Lead successfully saved to Google Sheets.');
    } else {
      console.warn('Google Sheets environment variables are incomplete. Skipping Sheets storage.');
    }

    // 2. Send email notification
    try {
      await sendNotificationEmail({
        name,
        phone,
        intent,
        type,
        area,
        budget,
        timeline,
        notes,
        source,
        timestamp,
      });
    } catch (emailError: any) {
      console.error('Failed to send lead email notification:', emailError.message || emailError);
      // Do not block client success if email notification fails but Sheets saved.
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lead submission API error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
