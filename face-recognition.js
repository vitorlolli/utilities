import * as canvas from 'canvas'
import * as faceapi from 'face-api.js'
import fs from 'fs'
import path from 'path'

await faceapi.nets.ssdMobilenetv1.loadFromDisk('./face-api-models')

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const face_path = './result/face'
const no_face_path = './result/no-face'

const getImages = () => fs.readdirSync('./input').map(image => path.join('./', 'input', image))

const images = getImages()

for (let index = 0; index < images.length; index++) {
    const image_path = images[index]
    const info = path.parse(image_path)
    const img = await canvas.loadImage(image_path)

    const detections = await faceapi.detectAllFaces(img)
    const destiny = detections.length > 0 ? face_path : no_face_path

    fs.renameSync(`${image_path}`, `${destiny}/${info.base}`)

    console.log(`${images.length} / ${index}`, image_path, destiny)
}
