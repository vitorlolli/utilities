const { Canvas } = require('skia-canvas')
var fs = require("fs")

function NodeCanvasFactory() { }
NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
        var canvas = new Canvas(width, height);
        var context = canvas.getContext("2d");
        return {
            canvas: canvas,
            context: context,
        };
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {

        // Zeroing the width and height cause Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    },
};

var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");

// Relative path of the PDF file.
var pdfURL = "./document.pdf";

// Read the PDF file into a typed array so PDF.js can load it.
var rawData = new Uint8Array(fs.readFileSync(pdfURL));

const init = async () => {
    var pdfDocument = await pdfjsLib.getDocument(rawData).promise;
    // console.log(pdfDocument.numPages)
    console.log(await pdfDocument.getPage(0))
}
init()

// Load the PDF file.
// var loadingTask = pdfjsLib.getDocument(rawData);
// loadingTask.promise
//     .then(function (pdfDocument) {
//         // console.log(pdfDocument)
//         console.log("# PDF document loaded.");

//         // Get the first page.
//         pdfDocument.getPage(1).then(function (page) {
//             // Render the page on a Node canvas with 100% scale.
//             var viewport = page.getViewport({ scale: 1.0 });
//             var canvasFactory = new NodeCanvasFactory();
//             var canvasAndContext = canvasFactory.create(
//                 viewport.width,
//                 viewport.height
//             );
//             var renderContext = {
//                 canvasContext: canvasAndContext.context,
//                 viewport: viewport,
//                 canvasFactory: canvasFactory,
//             };

//             var renderTask = page.render(renderContext);
//             renderTask.promise.then(async function () {
//                 // Convert the canvas to an image buffer.
//                 var image = await canvasAndContext.canvas.toBuffer();
//                 fs.writeFile("output.png", image, function (error) {
//                     if (error) {
//                         console.error("Error: " + error);
//                     } else {
//                         console.log(
//                             "Finished converting first page of PDF file to a PNG image."
//                         );
//                     }
//                 });
//             });
//         });
//     })
//     .catch(function (reason) {
//         console.log(reason);
//     });