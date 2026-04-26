document.getElementById('currentDate').innerText = new Date().toLocaleDateString('pt-BR');

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

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        const target = document.getElementById(targetId);
        if (target) {
            target.value = target.value ? target.value + ' ' + text : text;
            if (targetId === 'clientName') updateSignature();
        }
    };

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

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        const textarea = btn.previousElementSibling;
        if (textarea) {
            textarea.value = textarea.value ? textarea.value + ' ' + text : text;
            autoResize(textarea);
        }
    };
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
    selectedMaterial = mat;
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

    // Populate Material
    document.getElementById('materialText').innerText = selectedMaterial;

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
