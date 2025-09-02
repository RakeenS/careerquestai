// Helper function to send Discord webhook notifications
export const sendDiscordNotification = async (userData: {
  email: string;
  name?: string;
  signup_method?: 'email' | 'google';
}) => {
  try {
    const response = await fetch('/api/discord-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
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