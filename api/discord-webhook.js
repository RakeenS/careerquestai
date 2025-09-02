export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, signup_method = 'email' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1412546140875788379/op-nz8_Hpb3Yfjo8D4gkA_iQdHLE_HI70yIjwLhQnXQDDamjjlQsyjHOyqeuWw8JagS2';

    // Create Discord embed message
    const discordMessage = {
      embeds: [{
        title: "🎉 New User Signup!",
        color: 0x00ff00, // Green color
        fields: [
          {
            name: "📧 Email",
            value: email,
            inline: true
          },
          {
            name: "👤 Name",
            value: name || "Not provided",
            inline: true
          },
          {
            name: "🔐 Signup Method",
            value: signup_method === 'google' ? '🔍 Google OAuth' : '📧 Email/Password',
            inline: true
          },
          {
            name: "⏰ Time",
            value: new Date().toLocaleString(),
            inline: false
          }
        ],
        footer: {
          text: "CareerQuestAI - User Registration"
        },
        timestamp: new Date().toISOString()
      }]
    };

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    res.status(200).json({ success: true, message: 'Discord notification sent' });
  } catch (error) {
    console.error('Discord webhook error:', error);
    res.status(500).json({ error: 'Failed to send Discord notification' });
  }
}