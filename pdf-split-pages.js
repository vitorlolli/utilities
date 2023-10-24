import pdf from "./src/pdf.js"

// gerar pasta destino com base no nome do arquivo
const path = './documento.pdf'
await pdf.splitPages({ path, pathResult: './teste' })