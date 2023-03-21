const axios = require('axios')

async function sendEmojiStatsToApi(dataArray) {
  try {
    const response = await axios.post(
      'http://localhost:3001/api/saveEmojiStats',
      dataArray
    )
    console.log('Emoji statistics saved:')
  } catch (error) {
    console.error('Error saving emoji statistics:', error)
  }
}

function saveEmojiStats(emojiBufferStats) {
  if (emojiBufferStats.length > 0) {
    sendEmojiStatsToApi(emojiBufferStats)
    emojiBufferStats.length = 0
  }
}

module.exports = saveEmojiStats
