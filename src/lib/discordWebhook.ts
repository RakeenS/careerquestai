// Helper function to send Discord webhook notifications
export const sendDiscordNotification = async (userData: {
  email: string;
  name?: string;
  signup_method?: 'email' | 'google';
}) => {
  try {
    const webhookUrl = 'https://discord.com/api/webhooks/1412546140875788379/op-nz8_Hpb3Yfjo8D4gkA_iQdHLE_HI70yIjwLhQnXQDDamjjlQsyjHOyqeuWw8JagS2';

    // Create Discord embed message
    const discordMessage = {
      embeds: [{
        title: "🎉 New User Signup!",
        color: 0x00ff00, // Green color
        fields: [
          {
            name: "📧 Email",
            value: userData.email,
            inline: true
          },
          {
            name: "👤 Name",
            value: userData.name || "Not provided",
            inline: true
          },
          {
            name: "🔐 Signup Method",
            value: userData.signup_method === 'google' ? '🔍 Google OAuth' : '📧 Email/Password',
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

    // Send directly to Discord webhook
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

    console.log('Discord notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    // Don't throw error - webhook failure shouldn't break signup
    return false;
  }
};