//---SELECTORES DE ELEMENTOS---
const palavraInput = document.getElementById("palavra_input");
const listaPalavras = document.getElementById("lista_palavras");
const revisoesContainer = document.getElementById("revisoesContainer");
const form = document.getElementById("documentForm");
const output = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const gerarPdfBtn = document.getElementById("gerarPdfBtn");

let palavras = [];

//--- funções de manipulação de formulário---

//adiciona palavras-chave ao pressionar Enter

palavraInput.addEventListener("keypress", e => {
    if(e.key === "Enter"){
        e.preventDefault();
        const palavra = palavraInput.value.trim();
        if(palavra && !palavras.includes(palavra)){
            palavras.push(palavra);
            atualizarPalavras();
            palavraInput.value = "";
        }
    }
});

//Atualizar a lista de palavra-chave na tela e permite a remoção

function atualizarPalavras(){
    listaPalavras.innerHTML = "";
    palavras.forEach(p =>{
        const li = document.createElement("li")
        li.textContent = "p";
        li.addEventListener("click", () => {
            palavras = palavras.filter(item => item !== p);
        });
        listaPalavras.appendChild(li)
    });
}
//Adicionar dinamicamente os campos para uma nova revisao

document.getElementById("addRevisão").addEventListener("click", () =>{
    const div = document.createElement("div");
    div.classList.add("revisao");
    div.innerHTML = `
        <label>data:</label>
        <input type="datatime-local" class="data_revisao" required>
        <label>Revisao por:</label>
        <input type="text" class="revisao_por" required>
        <label>Comentário:</label>
        <input type="text class="comentario_revisao" required>
    `;
    revisoesContainer.appendChild(div);


});

//---Função cental para coletar os dados do formulário
//---Reutilizando para gerar tanto o JSON quanto o PDF

function construirDocumento(){
    //coleta todas as revisoes adicionadas
    const revisoesInputs = Array.from(document.querySelectorAll(".revisao"));
    const revisoes = revisoesInputs.map(div => ({
        data: div.querySelector(".data_revisao").value,
        revisado_por: div.querySelector(".revisado_por").value,
        comentario: div.querySelector(".comentario_revisao").value

    }));
    const document = {
        titulo:document.getElementById("titulo").value,
        tipo:document.getElementById("tipo").value,
        ano:parseInt(document.getElementById("ano").value),
        status:document.getElementById("status").values,
        data_envio:document.getElementById("data_envio").value,
        responsavel: {
            nome:document.getElementById("nome_responsavel").value,
            cargo:document.getElementById("cargo_responsavel").value,
            departamento: document.getElementById("departamento_responsavel").value
        },
        palavras_chave:palavras,
        revisoes
    };

    return document;

}

//--- Lógica de geração (json e PDF) ---
// Evento para gerar o documento JSON no formato MongoDB

form.addEventListener("submit", e => {
    e.preventDefault();
    const documento = construirDocumento();

    //Cria uma cópia do objeto para formatar as datas para mongoDb
    const documentoMongo = JSON.parse(JSON.stringify(documento));
    documentoMongo.data_envio = {"$data": documento.data_envio};
    documentoMongo.revioes.forEach(rev => {
        rev.data = {"$date": rev.data};
    });
    //Exibe o JSON formatado na tela

    output.textContent = JSON.stringify(documentoMongo,null,2);

});

//Evento para o botão de gerar o relatório em pdf
gerarPdfBtn.addEventListener("click",() => {
    const doc = construirDocumento();

    //Validação para garantir que o formulário foi preenchido

    if(!doc.titulo){
        alert("Por favor, preencha o formulário antesde gerar o PDF.");
        return;
    }

    //Acessa a biblioteca jsPDF que foi  carregada no HTML 
    const {jsPDF} = window.jsPDF;
    const pdf = new jsPDF();
    
    let y = 20; //Posição vertical inicial do documento pdf

    //--- Adiciona o conteúdo ao PDF---

    pdf.setFontsize(18);
    pdf.text(doc.titulo, 105, y, {align: 'center'});
    y +=15;

    pdf.setFontsize(12);
    pdf.text(`Tipo: ${doc.tipo}`,20,y);
    pdf.text(`Ano: ${doc.ano}`,120,y);
    y += 7;
    pdf.text(`Status: ${doc.status}`,20,y);
    pdf.text(`Data de Envio: ${new Date(doc.data_envio).toLocaleDateString('pt-br')}`,120, y);
    y += 15;

    //Seção do Responsavel
    pdf.setFontsize(14);
    pdf.text("Responsável", 20,y);
    y += 7;
    pdf.setFontsize(12);
    pdf.text(`-Nome: ${doc.responsavel.nome}`,25,y);

})