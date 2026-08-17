const formattedDate = new Date().toLocaleDateString('pt-BR');
if (document.getElementById('currentDate')) {
    document.getElementById('currentDate').innerText = formattedDate;
}
if (document.getElementById('materialsCurrentDate')) {
    document.getElementById('materialsCurrentDate').innerText = formattedDate;
}

// Tab Navigation Logic
function switchTab(tab) {
    const budgetView = document.getElementById('budgetView');
    const materialsView = document.getElementById('materialsView');
    const tabBudgetBtn = document.getElementById('tabBudgetBtn');
    const tabMaterialsBtn = document.getElementById('tabMaterialsBtn');

    if (tab === 'materials') {
        budgetView.classList.add('hidden');
        materialsView.classList.remove('hidden');

        tabMaterialsBtn.classList.add('tab-active');
        tabMaterialsBtn.classList.remove('text-gray-500');
        tabBudgetBtn.classList.remove('tab-active');
        tabBudgetBtn.classList.add('text-gray-500');
    } else {
        materialsView.classList.add('hidden');
        budgetView.classList.remove('hidden');

        tabBudgetBtn.classList.add('tab-active');
        tabBudgetBtn.classList.remove('text-gray-500');
        tabMaterialsBtn.classList.remove('tab-active');
        tabMaterialsBtn.classList.add('text-gray-500');
    }
}

// Materials Request List Logic
let materialsListItems = [];

function addMaterialItem(customText) {
    const inputEl = document.getElementById('matItemInput');
    const itemText = (customText !== undefined ? customText : inputEl.value).trim();

    if (!itemText) return;

    materialsListItems.push(itemText);
    if (inputEl) inputEl.value = '';

    renderMaterialsList();
}

function removeMaterialItem(index) {
    materialsListItems.splice(index, 1);
    renderMaterialsList();
}

function renderMaterialsList() {
    const listEl = document.getElementById('materialsList');
    const emptyMsgEl = document.getElementById('emptyMaterialsMsg');

    if (!listEl) return;

    listEl.innerHTML = '';

    if (materialsListItems.length === 0) {
        if (emptyMsgEl) emptyMsgEl.classList.remove('hidden');
        return;
    }

    if (emptyMsgEl) emptyMsgEl.classList.add('hidden');

    materialsListItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors group';

        // Escape item text to prevent HTML injection
        const safeItemText = item.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        li.innerHTML = `
            <span class="flex-1 pr-3 font-semibold text-slate-800 break-words">${safeItemText}</span>
            <button onclick="removeMaterialItem(${index})" class="no-print text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded text-sm transition-colors focus:outline-none" title="Remover item">
                ❌
            </button>
        `;
        listEl.appendChild(li);
    });
}

// Voice Input specifically for Materials List
let matSpeechRecognition = null;
let isListeningForMaterials = false;

function toggleVoiceInputForMaterials() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }

    const speechStatus = document.getElementById('speechStatus');
    const micBtn = document.getElementById('micMatBtn');
    const inputEl = document.getElementById('matItemInput');

    if (isListeningForMaterials && matSpeechRecognition) {
        matSpeechRecognition.stop();
        return;
    }

    matSpeechRecognition = new SpeechRecognition();
    matSpeechRecognition.lang = 'pt-BR';
    matSpeechRecognition.interimResults = false;
    matSpeechRecognition.maxAlternatives = 1;

    let recognizedText = "";

    matSpeechRecognition.onstart = function() {
        isListeningForMaterials = true;
        if (speechStatus) speechStatus.classList.remove('hidden');
        if (micBtn) micBtn.classList.add('text-red-500', 'animate-pulse');
    };

    matSpeechRecognition.onresult = function(event) {
        recognizedText = event.results[0][0].transcript;
        if (inputEl) {
            inputEl.value = recognizedText;
        }
    };

    matSpeechRecognition.onerror = function(event) {
        console.error('Erro de reconhecimento de voz:', event.error);
        if (speechStatus) speechStatus.classList.add('hidden');
        if (micBtn) micBtn.classList.remove('text-red-500', 'animate-pulse');
        isListeningForMaterials = false;
    };

    matSpeechRecognition.onend = function() {
        isListeningForMaterials = false;
        if (speechStatus) speechStatus.classList.add('hidden');
        if (micBtn) micBtn.classList.remove('text-red-500', 'animate-pulse');

        // Automatically add the item if text was recognized
        if (recognizedText.trim() !== '') {
            addMaterialItem(recognizedText);
        }
    };

    matSpeechRecognition.start();
}

// PDF Generation using html2pdf.js
function downloadMaterialsPDF() {
    if (typeof html2pdf === 'undefined') {
        alert("Biblioteca html2pdf.js não foi carregada. Verifique sua conexão com a internet.");
        return;
    }

    const serviceField = document.getElementById('matServiceField');
    const serviceName = serviceField ? serviceField.value.trim() : '';
    const cleanServiceName = serviceName.replace(/[^a-zA-Z0-9_ -]/g, '');
    const filename = cleanServiceName ? `Pedido_de_Materiais_-_${cleanServiceName}.pdf` : 'Pedido_de_Materiais.pdf';

    const element = document.getElementById('materialsPDFContainer');

    // Add generating-pdf class to ensure all .no-print elements (buttons, inputs) are hidden in PDF canvas
    element.classList.add('generating-pdf');

    // Options for html2pdf
    const opt = {
        margin:       [8, 8, 8, 8],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF and clean up class
    html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('generating-pdf');
    }).catch(err => {
        console.error('Erro ao gerar PDF:', err);
        element.classList.remove('generating-pdf');
        alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    });
}

function addRow() {
    const tbody = document.getElementById('itemsBody');
    const newRow = document.createElement('tr');
    newRow.className = 'text-gray-700 item-row';
    newRow.innerHTML = `
        <td class="py-3 px-2" data-label="Descrição do Serviço">
            <div class="flex items-start">
                <textarea rows="1" oninput="autoResize(this)" class="w-full font-semibold text-sm border-none bg-transparent outline-none resize-none overflow-hidden block" placeholder="Novo Serviço..."></textarea>
                <button onclick="startSpeechRecognitionForRow(this)" class="ml-2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none no-print" title="Falar">🎤</button>
            </div>
        </td>
        <td class="py-3 px-2" data-label="Qtd">
            <input type="number" value="1" oninput="calculate()" class="qty input-num text-center">
        </td>
        <td class="py-3 px-2" data-label="V. Unitário">
            <input type="number" value="0.00" oninput="calculate()" class="price input-num text-right">
        </td>
        <td class="py-3 px-2 text-right font-bold text-slate-900 text-sm subtotal" data-label="Subtotal">R$ 0,00</td>
        <td class="py-3 px-2 text-center no-print">
            <button onclick="removeRow(this)" class="text-red-400 hover:text-red-600">✕</button>
        </td>
    `;
    tbody.appendChild(newRow);
    calculate();
}

function removeRow(btn) {
    const row = btn.closest('tr');
    if (document.querySelectorAll('.item-row').length > 1) {
        row.remove();
        calculate();
    }
}

function calculate() {
    let total = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        const subtotal = qty * price;
        row.querySelector('.subtotal').innerText = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        total += subtotal;
    });
    document.getElementById('totalDisplay').innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateSignature() {
    const nameInput = document.getElementById('clientName');
    const signatureText = document.getElementById('clientSignature');
    if (nameInput && signatureText) {
        signatureText.innerText = nameInput.value || 'Assinatura do Cliente';
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function togglePreview() {
    const mainContainer = document.querySelector('.main-container');
    const previewBtn = document.getElementById('previewBtn');

    if (mainContainer.classList.contains('preview-mode')) {
        mainContainer.classList.remove('preview-mode');
        previewBtn.innerText = 'Visualizar Orçamento';
        previewBtn.classList.remove('bg-purple-800');
        previewBtn.classList.add('bg-purple-600');
    } else {
        mainContainer.classList.add('preview-mode');
        previewBtn.innerText = 'Editar Orçamento';
        previewBtn.classList.remove('bg-purple-600');
        previewBtn.classList.add('bg-purple-800');
    }
}

// Initial auto-resize for existing textareas
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResize(textarea);
    });
});


// Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function startSpeechRecognition(targetId) {
    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let recognizedText = "";

    recognition.onresult = function(event) {
        // Obter apenas o resultado final da fala
        recognizedText = event.results[0][0].transcript;
    };

    recognition.onend = function() {
        if (!recognizedText) return;
        const target = document.getElementById(targetId);
        if (target) {
            // Evitar duplicar a última frase exatamente
            if (!target.value.endsWith(recognizedText)) {
                target.value = target.value ? target.value + ' ' + recognizedText : recognizedText;
                if (targetId === 'clientName' || targetId === 'wizClientName') updateSignature();
            }
        }
    }

    recognition.onerror = function(event) {
        console.error('Erro de reconhecimento de voz:', event.error);
    };

    recognition.start();
}

function startSpeechRecognitionForRow(btn) {
    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    let recognizedText = "";

    recognition.onresult = function(event) {
        recognizedText = event.results[0][0].transcript;
    };

    recognition.onend = function() {
        if (!recognizedText) return;
        const textarea = btn.previousElementSibling;
        if (textarea) {
            if (!textarea.value.endsWith(recognizedText)) {
                textarea.value = textarea.value ? textarea.value + ' ' + recognizedText : recognizedText;
                autoResize(textarea);
            }
        }
    }

    recognition.start();
}

// Wizard Logic
let currentWizardStep = 1;
const totalSteps = 5;
let wizardServices = [];
let selectedMaterial = 'Material não especificado.';

function openWizard() {
    document.getElementById('wizardModal').classList.remove('hidden');
    currentWizardStep = 1;
    wizardServices = [];
    selectedMaterial = 'Material não especificado.';
    showWizardStep(1);
}

function closeWizard() {
    document.getElementById('wizardModal').classList.add('hidden');
}

function showWizardStep(step) {
    for (let i = 1; i <= totalSteps; i++) {
        const el = document.getElementById('wizardStep' + i);
        if (el) el.classList.add('hidden');
    }
    const currentEl = document.getElementById('wizardStep' + step);
    if (currentEl) currentEl.classList.remove('hidden');
}

function nextWizardStep(step) {
    currentWizardStep = step;
    showWizardStep(step);
}

function prevWizardStep(step) {
    currentWizardStep = step;
    showWizardStep(step);
}

function addWizardService(proceed) {
    const desc = document.getElementById('wizServiceDesc').value.trim();
    const qty = parseFloat(document.getElementById('wizServiceQty').value) || 1;
    const price = parseFloat(document.getElementById('wizServicePrice').value) || 0;

    if (desc) {
        wizardServices.push({ desc, qty, price });
    }

    // Reset fields
    document.getElementById('wizServiceDesc').value = '';
    document.getElementById('wizServiceQty').value = '1';
    document.getElementById('wizServicePrice').value = '';

    if (proceed) {
        nextWizardStep(5);
    } else {
        alert('Serviço adicionado! Pode inserir o próximo.');
    }
}

function selectMaterial(mat, btn) {
    if (mat.includes('Contratado')) {
        selectedMaterial = 'contratado';
    } else if (mat.includes('Contratante')) {
        selectedMaterial = 'cliente';
    } else {
        selectedMaterial = 'misto';
    }

    document.querySelectorAll('.matBtn').forEach(b => {
        b.classList.remove('bg-blue-50', 'border-blue-500');
    });
    btn.classList.add('bg-blue-50', 'border-blue-500');
}

function finishWizard() {
    // Populate Client Data
    const name = document.getElementById('wizClientName').value;
    const doc = document.getElementById('wizClientDoc').value;
    const loc = document.getElementById('wizClientLocation').value;

    if (name) {
        document.getElementById('clientName').value = name;
        updateSignature();
    }
    if (doc) document.getElementById('clientDoc').value = doc;
    if (loc) document.getElementById('clientLocation').value = loc;

    // Populate Material no texto das observacoes gerais
    const obsMatElement = document.getElementById('obsMaterial');
    if (obsMatElement) {
        if (selectedMaterial === 'misto') {
            obsMatElement.innerText = `• O cliente tem alguns materiais, porém o contratado arca com outros.`;
        } else {
            obsMatElement.innerText = `• Materiais fornecidos pelo ${selectedMaterial}.`;
        }
    }

    // Populate Services
    if (wizardServices.length > 0) {
        const tbody = document.getElementById('itemsBody');
        tbody.innerHTML = ''; // Clear existing initial row

        wizardServices.forEach(srv => {
            const newRow = document.createElement('tr');
            newRow.className = 'text-gray-700 item-row';
            newRow.innerHTML = `
                <td class="py-3 px-2" data-label="Descrição do Serviço">
                    <div class="flex items-start">
                        <textarea rows="1" oninput="autoResize(this)" class="w-full font-semibold text-sm border-none bg-transparent outline-none resize-none overflow-hidden block">${srv.desc}</textarea>
                        <button onclick="startSpeechRecognitionForRow(this)" class="ml-2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none no-print" title="Falar">🎤</button>
                    </div>
                </td>
                <td class="py-3 px-2" data-label="Qtd">
                    <input type="number" value="${srv.qty}" oninput="calculate()" class="qty input-num text-center">
                </td>
                <td class="py-3 px-2" data-label="V. Unitário">
                    <input type="number" value="${srv.price.toFixed(2)}" oninput="calculate()" class="price input-num text-right">
                </td>
                <td class="py-3 px-2 text-right font-bold text-slate-900 text-sm subtotal" data-label="Subtotal">R$ 0,00</td>
                <td class="py-3 px-2 text-center no-print">
                    <button onclick="removeRow(this)" class="text-red-400 hover:text-red-600">✕</button>
                </td>
            `;
            tbody.appendChild(newRow);

            // Auto resize immediately for the injected text
            const ta = newRow.querySelector('textarea');
            autoResize(ta);
        });
        calculate();
    }

    closeWizard();
}

function customPrint() {
    const clientName = document.getElementById('clientName').value.trim();
    const defaultName = clientName ? `Orçamento Célio Torres - ${clientName}` : "Orçamento Célio Torres";

    const fileName = prompt("Salvar arquivo como:", defaultName);

    if (fileName !== null) {
        const originalTitle = document.title;
        document.title = fileName; // Altera o titulo para que o navegador sugira este nome

        // Abre o prompt de impressao
        window.print();

        // Restaura o titulo apos um pequeno delay
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    }
}
