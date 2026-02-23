import express from "express"
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import path from "path"
import { generateTunzyId } from "./id.js"

const router = express.Router()

router.post("/pair", async (req, res) => {
  const { number } = req.body

  if (!number) {
    return res.json({ error: "Phone number required" })
  }

  const sessionId = generateTunzyId()
  const sessionFolder = path.join(process.cwd(), sessionId)

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on("creds.update", saveCreds)

  try {
    const code = await sock.requestPairingCode(number)
    res.json({
      status: "success",
      sessionId,
      pairingCode: code,
      download: `/api/download/${sessionId}`
    })
  } catch (err) {
    res.json({ error: "Failed to generate pairing code" })
  }
})

router.get("/download/:id", (req, res) => {
  const file = path.join(process.cwd(), req.params.id, "creds.json")
  res.download(file)
})

export default router
