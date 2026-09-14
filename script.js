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
    const myBudgetsView = document.getElementById('myBudgetsView');

    const tabBudgetBtn = document.getElementById('tabBudgetBtn');
    const tabMaterialsBtn = document.getElementById('tabMaterialsBtn');
    const tabMyBudgetsBtn = document.getElementById('tabMyBudgetsBtn');

    if (budgetView) budgetView.classList.add('hidden');
    if (materialsView) materialsView.classList.add('hidden');
    if (myBudgetsView) myBudgetsView.classList.add('hidden');

    if (tabBudgetBtn) { tabBudgetBtn.classList.remove('tab-active'); tabBudgetBtn.classList.add('text-gray-500'); }
    if (tabMaterialsBtn) { tabMaterialsBtn.classList.remove('tab-active'); tabMaterialsBtn.classList.add('text-gray-500'); }
    if (tabMyBudgetsBtn) { tabMyBudgetsBtn.classList.remove('tab-active'); tabMyBudgetsBtn.classList.add('text-gray-500'); }

    if (tab === 'materials') {
        if (materialsView) materialsView.classList.remove('hidden');
        if (tabMaterialsBtn) {
            tabMaterialsBtn.classList.add('tab-active');
            tabMaterialsBtn.classList.remove('text-gray-500');
        }
    } else if (tab === 'myBudgets') {
        if (myBudgetsView) myBudgetsView.classList.remove('hidden');
        if (tabMyBudgetsBtn) {
            tabMyBudgetsBtn.classList.add('tab-active');
            tabMyBudgetsBtn.classList.remove('text-gray-500');
        }
        renderMyBudgetsList();
    } else {
        if (budgetView) budgetView.classList.remove('hidden');
        if (tabBudgetBtn) {
            tabBudgetBtn.classList.add('tab-active');
            tabBudgetBtn.classList.remove('text-gray-500');
        }
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
    if (element) {
        element.classList.add('is-exporting-pdf');
    }

    // Options for html2pdf
    const opt = {
        margin:       [8, 8, 8, 8],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    html2pdf().set(opt).from(element).save().catch(err => {
        console.error('Erro ao gerar PDF:', err);
        alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    }).finally(() => {
        if (element) {
            element.classList.remove('is-exporting-pdf');
        }
    });
}

// BRL Currency Helpers
function parseBRL(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const str = value.toString().trim();
    if (!str.includes(',') && str.includes('.')) {
        return parseFloat(str) || 0;
    }
    const cleanStr = str.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleanStr) || 0;
}

function formatBRLValue(val) {
    const num = typeof val === 'number' ? val : parseBRL(val);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatBRLInput(input) {
    let rawValue = input.value.replace(/\D/g, '');
    if (!rawValue) {
        input.value = 'R$ 0,00';
        return;
    }
    let numValue = parseInt(rawValue, 10) / 100;
    input.value = numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
            <input type="text" value="R$ 0,00" oninput="formatBRLInput(this); calculate()" class="price input-num text-right">
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
        const qtyEl = row.querySelector('.qty');
        const priceEl = row.querySelector('.price');
        const qty = parseFloat(qtyEl ? qtyEl.value : 0) || 0;
        const price = priceEl ? parseBRL(priceEl.value) : 0;
        const subtotal = qty * price;
        const subtotalEl = row.querySelector('.subtotal');
        if (subtotalEl) {
            subtotalEl.innerText = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        total += subtotal;
    });
    const totalDisplay = document.getElementById('totalDisplay');
    if (totalDisplay) {
        totalDisplay.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
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
    const priceVal = document.getElementById('wizServicePrice').value;
    const price = parseBRL(priceVal);

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
                    <input type="text" value="${formatBRLValue(srv.price)}" oninput="formatBRLInput(this); calculate()" class="price input-num text-right">
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

// --- Persistence Service Layer (budgetService) ---
const LEGACY_STORAGE_KEY = 'orcador_budgets_v1';
const LEGACY_MIGRATION_KEY = 'orcador_budgets_supabase_migrated';
const supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_PUBLISHABLE_KEY
);

function generateBudgetId(clientName, dateStr) {
    let nameSlug = (clientName || 'cliente')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'cliente';

    let formattedDate = '';
    if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}${parts[1].padStart(2, '0')}${parts[0].padStart(2, '0')}`;
        }
    }
    if (!formattedDate) {
        formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    }

    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    return `${nameSlug}-${formattedDate}-${randomSeq}`;
}

function mapBudgetRow(row) {
    if (!row) return null;
    return {
        ...row,
        clientName: row.clientname,
        clientDoc: row.clientdoc,
        clientLocation: row.clientlocation,
        createdAt: row.createdat,
        updatedAt: row.updatedat
    };
}

const budgetService = {
    async getAll() {
        await this.migrateLegacyData();
        const { data, error } = await supabaseClient
            .from('budgets')
            .select('*')
            .order('updatedat', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapBudgetRow);
    },

    async migrateLegacyData() {
        if (localStorage.getItem(LEGACY_MIGRATION_KEY)) return;

        try {
            const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
            const legacyBudgets = stored ? JSON.parse(stored) : [];
            for (const budget of legacyBudgets) {
                await this.save(budget);
            }
            localStorage.setItem(LEGACY_MIGRATION_KEY, 'true');
        } catch (error) {
            console.warn('Não foi possível migrar os orçamentos locais:', error);
        }
    },

    async getById(id) {
        const { data, error } = await supabaseClient
            .from('budgets')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return mapBudgetRow(data);
    },

    async save(budgetData) {
        const now = new Date().toISOString();
        const id = budgetData.id || generateBudgetId(budgetData.clientName, budgetData.date);
        const payload = {
            id,
            clientname: budgetData.clientName || '',
            clientdoc: budgetData.clientDoc || '',
            clientlocation: budgetData.clientLocation || '',
            date: budgetData.date || '',
            items: budgetData.items || [],
            obs: budgetData.obs || '',
            total: budgetData.total || 0,
            createdat: budgetData.createdAt || now,
            updatedat: now
        };

        const { data, error } = await supabaseClient
            .from('budgets')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return mapBudgetRow(data);
    },

    async delete(id) {
        const { error } = await supabaseClient.from('budgets').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async duplicate(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const existing = await this.getById(id);
                if (!existing) {
                    throw new Error('Orçamento não encontrado para duplicação.');
                }
                const duplicateData = JSON.parse(JSON.stringify(existing));
                delete duplicateData.id;
                delete duplicateData.createdAt;
                delete duplicateData.updatedAt;
                duplicateData.clientName = `${duplicateData.clientName || 'Cliente'} (Cópia)`;
                const saved = await this.save(duplicateData);
                resolve(saved);
            } catch (err) {
                console.error('Erro ao duplicar orçamento:', err);
                reject(err);
            }
        });
    }
};

// --- Form State & Auto-Save Logic ---
let currentBudgetId = null;
let autoSaveTimeout = null;

function showAutoSaveStatus(message) {
    const indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) return;
    indicator.innerText = message;
    indicator.classList.remove('hidden');
    setTimeout(() => {
        indicator.classList.add('hidden');
    }, 2500);
}

function getFormData() {
    const clientName = document.getElementById('clientName')?.value || '';
    const clientDoc = document.getElementById('clientDoc')?.value || '';
    const clientLocation = document.getElementById('clientLocation')?.value || '';
    const date = document.getElementById('currentDate')?.innerText || new Date().toLocaleDateString('pt-BR');

    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const descArea = row.querySelector('textarea');
        const qtyInput = row.querySelector('.qty');
        const priceInput = row.querySelector('.price');

        const desc = descArea ? descArea.value : '';
        const qty = parseFloat(qtyInput ? qtyInput.value : 1) || 0;
        const price = parseBRL(priceInput ? priceInput.value : 0);

        if (desc.trim() || qty || price) {
            items.push({ desc, qty, price });
        }
    });

    const obsElement = document.querySelector('[contenteditable="true"]');
    const obs = obsElement ? obsElement.innerHTML : '';

    const totalStr = document.getElementById('totalDisplay')?.innerText || 'R$ 0,00';
    const total = parseBRL(totalStr);

    return {
        id: currentBudgetId,
        clientName,
        clientDoc,
        clientLocation,
        date,
        items,
        obs,
        total
    };
}

function triggerAutoSave() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        const data = getFormData();
        if (!data.clientName && data.items.length === 0) return;

        try {
            const saved = await budgetService.save(data);
            if (saved && saved.id) {
                currentBudgetId = saved.id;
                showAutoSaveStatus('✓ Salvo');
            }
        } catch (err) {
            console.error('Erro no salvamento automático:', err);
        }
    }, 1200);
}

function loadBudgetIntoForm(budget) {
    currentBudgetId = budget.id;

    const nameInput = document.getElementById('clientName');
    const docInput = document.getElementById('clientDoc');
    const locInput = document.getElementById('clientLocation');
    const dateEl = document.getElementById('currentDate');

    if (nameInput) nameInput.value = budget.clientName || '';
    if (docInput) docInput.value = budget.clientDoc || '';
    if (locInput) locInput.value = budget.clientLocation || '';
    if (dateEl && budget.date) dateEl.innerText = budget.date;

    const obsElement = document.querySelector('[contenteditable="true"]');
    if (obsElement && budget.obs) {
        obsElement.innerHTML = budget.obs;
    }

    const tbody = document.getElementById('itemsBody');
    if (tbody) {
        tbody.innerHTML = '';
        const itemsToLoad = (budget.items && budget.items.length > 0) ? budget.items : [{ desc: '', qty: 1, price: 0 }];

        itemsToLoad.forEach(item => {
            const newRow = document.createElement('tr');
            newRow.className = 'text-gray-700 item-row';
            newRow.innerHTML = `
                <td class="py-3 px-2" data-label="Descrição do Serviço">
                    <div class="flex items-start">
                        <textarea rows="1" oninput="autoResize(this)" class="w-full font-semibold text-sm border-none bg-transparent outline-none resize-none overflow-hidden block">${item.desc || ''}</textarea>
                        <button onclick="startSpeechRecognitionForRow(this)" class="ml-2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none no-print" title="Falar">🎤</button>
                    </div>
                </td>
                <td class="py-3 px-2" data-label="Qtd">
                    <input type="number" value="${item.qty || 1}" oninput="calculate()" class="qty input-num text-center">
                </td>
                <td class="py-3 px-2" data-label="V. Unitário">
                    <input type="text" value="${formatBRLValue(item.price || 0)}" oninput="formatBRLInput(this); calculate()" class="price input-num text-right">
                </td>
                <td class="py-3 px-2 text-right font-bold text-slate-900 text-sm subtotal" data-label="Subtotal">R$ 0,00</td>
                <td class="py-3 px-2 text-center no-print">
                    <button onclick="removeRow(this)" class="text-red-400 hover:text-red-600">✕</button>
                </td>
            `;
            tbody.appendChild(newRow);
            const ta = newRow.querySelector('textarea');
            if (ta) autoResize(ta);
        });
    }

    updateSignature();
    calculate();
    switchTab('budget');
}

function createNewBudget() {
    currentBudgetId = null;

    const nameInput = document.getElementById('clientName');
    const docInput = document.getElementById('clientDoc');
    const locInput = document.getElementById('clientLocation');

    if (nameInput) nameInput.value = '';
    if (docInput) docInput.value = '';
    if (locInput) locInput.value = '';

    const obsElement = document.querySelector('[contenteditable="true"]');
    if (obsElement) {
        obsElement.innerHTML = `
            <p>• Mão de obra especializada com garantia de alinhamento.</p>
            <p id="obsMaterial">• Materiais fornecidos pelo cliente.</p>
            <p>• Pagamento efetuado após a conclusão do serviço.</p>
        `;
    }

    const tbody = document.getElementById('itemsBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="item-row">
                <td class="py-4 px-2" data-label="Descrição do Serviço">
                    <div class="flex items-start">
                        <textarea rows="1" oninput="autoResize(this)" class="w-full font-semibold text-sm border-none bg-transparent outline-none resize-none overflow-hidden block">Instalação de Conjunto de Batente</textarea>
                        <button onclick="startSpeechRecognitionForRow(this)" class="ml-2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none no-print" title="Falar">🎤</button>
                    </div>
                </td>
                <td class="py-4 px-2" data-label="Qtd"><input type="number" value="1" oninput="calculate()" class="qty input-num text-center"></td>
                <td class="py-4 px-2" data-label="V. Unitário"><input type="text" value="R$ 40,00" oninput="formatBRLInput(this); calculate()" class="price input-num text-right"></td>
                <td class="py-4 px-2 text-right font-bold text-sm subtotal" data-label="Subtotal">R$ 40,00</td>
                <td class="py-4 px-2 no-print text-center"><button onclick="removeRow(this)" class="text-red-400">✕</button></td>
            </tr>
        `;
        const ta = tbody.querySelector('textarea');
        if (ta) autoResize(ta);
    }

    updateSignature();
    calculate();
    switchTab('budget');
}

// --- Dashboard "Meus Orçamentos" Handlers ---
async function renderMyBudgetsList(filterText = '') {
    const listEl = document.getElementById('myBudgetsList');
    const emptyMsgEl = document.getElementById('emptyBudgetsMsg');
    if (!listEl) return;

    listEl.innerHTML = '<div class="p-8 text-center text-slate-400 text-sm">Carregando orçamentos...</div>';

    let budgets;
    try {
        budgets = await budgetService.getAll();
    } catch (error) {
        console.error('Erro ao carregar orçamentos do Supabase:', error);
        listEl.innerHTML = '<div class="p-8 text-center text-red-600 text-sm">Não foi possível acessar os orçamentos. Verifique as políticas de acesso da tabela no Supabase.</div>';
        if (emptyMsgEl) emptyMsgEl.classList.add('hidden');
        return;
    }
    const query = filterText.toLowerCase().trim();

    const filtered = budgets.filter(b => {
        if (!query) return true;
        const client = (b.clientName || '').toLowerCase();
        const location = (b.clientLocation || '').toLowerCase();
        const doc = (b.clientDoc || '').toLowerCase();
        const id = (b.id || '').toLowerCase();
        const itemsText = (b.items || []).map(i => (i.desc || '').toLowerCase()).join(' ');

        return client.includes(query) || location.includes(query) || doc.includes(query) || id.includes(query) || itemsText.includes(query);
    });

    listEl.innerHTML = '';

    if (filtered.length === 0) {
        if (emptyMsgEl) emptyMsgEl.classList.remove('hidden');
        return;
    }

    if (emptyMsgEl) emptyMsgEl.classList.add('hidden');

    filtered.forEach(budget => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 transition-all';

        const safeClient = (budget.clientName || 'Cliente sem nome').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeLocation = (budget.clientLocation || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        card.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 class="font-bold text-slate-800 text-base sm:text-lg">${safeClient}</h3>
                    <span class="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 break-all">${budget.id}</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span>📅 ${budget.date || ''}</span>
                    ${safeLocation ? `<span>📍 ${safeLocation}</span>` : ''}
                    <span>📦 ${(budget.items || []).length} item(ns)</span>
                </div>
            </div>
            <div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div class="text-left md:text-right">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span class="text-lg font-bold text-blue-600">${formatBRLValue(budget.total || 0)}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                    <button onclick="editBudgetAction('${budget.id}')" title="Editar" class="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                        ✏️ <span class="hidden sm:inline">Editar</span>
                    </button>
                    <button onclick="downloadBudgetPDFAction('${budget.id}')" title="Baixar PDF" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                        📄 <span class="hidden sm:inline">PDF</span>
                    </button>
                    <button onclick="duplicateBudgetAction('${budget.id}')" title="Duplicar" class="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                        📋 <span class="hidden sm:inline">Duplicar</span>
                    </button>
                    <button onclick="deleteBudgetAction('${budget.id}')" title="Excluir" class="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        listEl.appendChild(card);
    });
}

function filterBudgetsList() {
    const searchInput = document.getElementById('budgetSearchInput');
    const val = searchInput ? searchInput.value : '';
    renderMyBudgetsList(val);
}

async function editBudgetAction(id) {
    const budget = await budgetService.getById(id);
    if (budget) {
        loadBudgetIntoForm(budget);
    }
}

async function duplicateBudgetAction(id) {
    await budgetService.duplicate(id);
    const searchInput = document.getElementById('budgetSearchInput');
    renderMyBudgetsList(searchInput ? searchInput.value : '');
}

async function deleteBudgetAction(id) {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        await budgetService.delete(id);
        if (currentBudgetId === id) {
            currentBudgetId = null;
        }
        const searchInput = document.getElementById('budgetSearchInput');
        renderMyBudgetsList(searchInput ? searchInput.value : '');
    }
}

async function downloadBudgetPDFAction(id) {
    const budget = await budgetService.getById(id);
    if (!budget) return;

    loadBudgetIntoForm(budget);

    if (typeof html2pdf !== 'undefined') {
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) mainContainer.classList.add('is-exporting-pdf');

        const clientNameClean = (budget.clientName || 'Cliente').replace(/[^a-zA-Z0-9_ -]/g, '');
        const filename = `Orcamento_Contrutorres_-_${clientNameClean || 'Cliente'}.pdf`;

        const opt = {
            margin: [8, 8, 8, 8],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(mainContainer).save().catch(err => {
            console.error('Erro ao gerar PDF:', err);
            customPrint();
        }).finally(() => {
            if (mainContainer) mainContainer.classList.remove('is-exporting-pdf');
        });
    } else {
        customPrint();
    }
}

// Bind auto-save listeners on DOM content loaded
window.addEventListener('DOMContentLoaded', () => {
    const budgetView = document.getElementById('budgetView');
    if (budgetView) {
        budgetView.addEventListener('input', triggerAutoSave);
        budgetView.addEventListener('change', triggerAutoSave);
    }
});
