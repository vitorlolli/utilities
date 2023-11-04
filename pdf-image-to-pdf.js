import pdf from "./src/pdf.js"

// gerar pasta destino com base no nome do arquivo
const path = './image.jpeg'
await pdf.imageToPdf({ imagePath: path, pageSize: { width: 595, height: 842 } })