import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve, extname } from 'path'
import { PDFDocument } from 'pdf-lib'

const splitPages = async ({ path, pathResult }) => {
    const pdfFile = readFileSync(path)
    const pdfFileDoc = await PDFDocument.load(pdfFile)
    const pdfDocResult = await PDFDocument.create()
    const [...pages] = await pdfDocResult.copyPages(pdfFileDoc, pdfFileDoc.getPageIndices())

    for (let index = 0; index < pages.length; index++) {
        const page = pages[index]
        if (pdfDocResult.getPageCount() > 0) {
            pdfDocResult.removePage(0)
        }
        pdfDocResult.addPage(page)
        const pdfBytes = await pdfDocResult.save()
        writeFileSync(resolve(pathResult, `page-${index}.pdf`), pdfBytes)
    }
}

const imageToPdf = async ({ imagePath, pageSize }) => {
    const pdfDoc = await PDFDocument.create()
    const jpgImageBytes = readFileSync(imagePath)
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
    const jpgDims = jpgImage.scaleToFit(pageSize.width, pageSize.height)
    const page = pdfDoc.addPage()
    page.setSize(pageSize.width, pageSize.height)
    page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: pageSize.width,
        height: pageSize.height,
    })
    const pdfBytes = await pdfDoc.save()
    const pdfName = `${imagePath.replace(extname(imagePath), '')}.pdf`
    writeFileSync(pdfName, pdfBytes)
}

const mergePDFs = async ({ pathDirPdfs, pathResult }) => {
    const pdfs = readdirSync(pathDirPdfs)
    const pdfDocResult = await PDFDocument.create()
    for (let index = 0; index < pdfs.length; index++) {
        const pdf = pdfs[index]
        const pdfFile = readFileSync(`${pathDirPdfs}/${pdf}`)
        const pdfFileDoc = await PDFDocument.load(pdfFile)
        const [...pages] = await pdfDocResult.copyPages(pdfFileDoc, pdfFileDoc.getPageIndices())
        pages.forEach(page => {
            pdfDocResult.addPage(page)
        })
    }
    const pdfBytes = await pdfDocResult.save()
    writeFileSync(pathResult, pdfBytes)
}

export default {
    splitPages,
    imageToPdf,
    mergePDFs
}