import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const path = join(root, 'media/video-seedance.json')
const video = JSON.parse(readFileSync(path, 'utf8'))
video.result_url = 'https://d8j0ntlcm91z4.cloudfront.net/user_3K9K0jUawN9jpB2bsvR8pwe2uEm/hf_20261005_205433_738add13-9114-4907-b14a-e0f5886eab0d.mp4'
video.status = 'completed'
video.type = 'video'
const original = join(root, 'media/originais', video.file)
if (!existsSync(original)) {
  const response = await fetch(video.result_url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  writeFileSync(original, Buffer.from(await response.arrayBuffer()))
}
mkdirSync(join(root, 'public/video'), { recursive: true })
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', original, '-an', '-vf', 'scale=640:-2,fps=24', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(root, 'public', video.src)], { stdio: 'inherit' })
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', original, '-vf', 'fps=1,scale=240:-2,tile=3x2', '-frames:v', '1', join(root, 'media/dragao-seedance-contato.jpg')], { stdio: 'inherit' })
const manifestPath = join(root, 'media/manifesto-atelier.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.previousVideos ??= [manifest.video]
manifest.video = video
manifest.additionalApprovedCredits = 42
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(path, JSON.stringify(video, null, 2) + '\n')
console.log('Vídeo Seedance otimizado e versão anterior preservada.')
