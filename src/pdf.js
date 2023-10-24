import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
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

export default {
    splitPages
}