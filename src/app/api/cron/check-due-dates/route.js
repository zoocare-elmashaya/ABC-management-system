import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 3. Query all unsent records matching tomorrow's date
    const { data: records, error } = await supabase
      .from('records')
      .select('id, user_id')
      .eq('due_date', tomorrowStr)
      .eq('send', false);

    if (error) throw error;
    if (!records || records.length === 0) {
      return NextResponse.json({ message: 'No records due tomorrow.' });
    }
    const userIdsToNotify = [...new Set(records.map(r => r.user_id))];
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        target_channel: 'push',
        include_aliases: {
          external_id: userIdsToNotify
        },
        headings: { en: 'Records Due Tomorrow!' },
        contents: { en: 'You have records due tomorrow that have not been sent yet.' },
        url: '/alert/tomorrow'
      })
    });

    const osData = await response.json();

    return NextResponse.json({ 
      success: true, 
      notifiedUsers: userIdsToNotify.length,
      oneSignalResponse: osData 
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}