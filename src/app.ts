// Get environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import Telegraf from 'telegraf'
import textToPicture = require('text-to-picture')

const bot = new Telegraf(process.env.TOKEN)
const ownerId = parseInt(process.env.ADMIN, 10)

const stickerSetName = 'phpSuckedSeconds'

bot.start(async ctx => {
  try {
    const botUsername = (await bot.telegram.getMe()).username
    const stickerId = await getStickerId()
    await ctx.telegram.createNewStickerSet(
      ownerId,
      `${stickerSetName}_by_${botUsername}`,
      'PHP sucked for this many seconds',
      {
        png_sticker: stickerId,
        emojis: '💩',
        mask_position: undefined,
      }
    )
    const stickerSet = await bot.telegram.getStickerSet(
      `${stickerSetName}_by_${botUsername}`
    )
    const sticker = stickerSet.stickers[0]
    return ctx.replyWithSticker(sticker.file_id)
  } catch (err) {
    return ctx.reply(err.message)
  }
})

setInterval(updateSticker, 60 * 1000)
async function updateSticker() {
  console.log('Updating stickers')
  const botUsername = (await bot.telegram.getMe()).username
  const stickerSet = await bot.telegram.getStickerSet(
    `${stickerSetName}_by_${botUsername}`
  )
  const sticker = stickerSet.stickers[0]
  await bot.telegram.deleteStickerFromSet(sticker.file_id)
  await bot.telegram.addStickerToSet(
    ownerId,
    stickerSetName,
    {
      png_sticker: await getStickerId(),
      emojis: '💩',
      mask_position: undefined,
    },
    false
  )
  console.log('Updated stickers')
}

async function getStickerId() {
  const secondsAfterPHP = Math.floor(
    new Date().getTime() / 1000 - new Date('1995').getTime() / 1000
  )
  const result = await textToPicture.convert({
    text: `${secondsAfterPHP}`,
    source: {
      width: 512,
      height: 512,
      background: '0xFF0000FF',
    },
    color: 'white',
  })
  const file = await bot.telegram.uploadStickerFile(ownerId, {
    source: await result.getBuffer(),
  })
  return file.file_id
}

bot.launch().then(() => console.log("It's alive!"))
