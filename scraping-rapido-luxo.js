import fetch from "node-fetch"
import * as cheerio from "cheerio"
import slugify from "slugify"

const response = await fetch('https://www.rapidocampinas.com.br/itinerarios/ajax/get_linhas.php?funcao=listalinhas')
const json = await response.json()

const busca_linhas = [
    '0408.10',
    '0409.10',
    '0405.10',
    '405A.11',
    '0403.10',
    '0413.10',
    '0411.10'
]

const extrairHorarios = async (linha) => {
    const $ = await cheerio.fromURL(`https://www.rapidocampinas.com.br/itinerarios/consultalinha.php?id=${linha.id}`)
    const itens = $("div.titulo > div.panel.panel-default")
        .get()
        .filter((_, index) => index + 1 <= 3)
        .map((item) => {
            const tipo = slugify($(item).find(".panel-heading").text(), {
                lower: true,
                trim: true,
                replacement: "_",
            })
            let panel
            if (tipo == "segunda_a_sexta-feira") {
                panel = $(item)
                    .find(".panel-body > .col-md-12 > .row")
                    .children()
                    .last()
            } else {
                panel = $(item)
                    .find(".panel-body > .col-md-12")
            }

            const horarios = $(panel).find('.dimensao').get()
            const from_bairro = $(horarios[0])
                .find('div')
                .get()
                .map(div => $(div).text().trim())
                .map(h => {
                    const [hora, minuto] = h.split(':')
                    return { hora: Number(hora), minuto: Number(minuto) }
                })
            const from_terminal = $(horarios[1])
                .find('div')
                .get()
                .map(div => $(div).text().trim())
                .map(h => {
                    const [hora, minuto] = h.split(':')
                    return { hora: Number(hora) == 24 ? 0 : Number(hora), minuto: Number(minuto) }
                })
            return {
                tipo,
                from_bairro,
                from_terminal
            }
        })
    return {
        id: linha.id,
        nome: linha.nome,
        TP: linha.TP,
        horarios: itens
    }
}

const linhas = json
    .filter(item => busca_linhas.includes(item.CodigoSPT))
    .map(item => ({ id: item.CodigoSPT, nome: item.CadastroLinha, TP: item.TP }))

const dados = (await Promise.all(linhas.map(linha => extrairHorarios(linha))))
    .sort((a, b) => a.TP > b.TP ? 1 : -1)

console.log(dados.map(item => item.horarios))
