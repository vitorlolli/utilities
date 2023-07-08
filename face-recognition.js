import * as canvas from 'canvas'
import * as faceapi from 'face-api.js'


await faceapi.nets.ssdMobilenetv1.loadFromDisk('./face-api-models')

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const imagePath = ''
const img = await canvas.loadImage(imagePath)

const detections = await faceapi.detectAllFaces(img)
console.log(detections)