import imageSize from "image-size"
import pdf from "./src/pdf.js"

// gerar pasta destino com base no nome do arquivo
const path = './teste/4.jpeg'
const size = imageSize(path)

await pdf.imageToPdf({ imagePath: path, pageSize: { width: size.width, height: size.height } })