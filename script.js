document.getElementById('currentDate').innerText = new Date().toLocaleDateString('pt-BR');

function addRow() {
    const tbody = document.getElementById('itemsBody');
    const newRow = document.createElement('tr');
    newRow.className = 'text-gray-700 item-row';
    newRow.innerHTML = `
        <td class="py-3 px-2" data-label="Descrição do Serviço">
            <textarea rows="1" oninput="autoResize(this)" class="w-full font-semibold text-sm border-none bg-transparent outline-none resize-none overflow-hidden block" placeholder="Novo Serviço..."></textarea>
            <textarea rows="1" oninput="autoResize(this)" class="w-full text-[11px] text-gray-500 mt-0.5 border-none bg-transparent outline-none resize-none overflow-hidden block" placeholder="Detalhes..."></textarea>
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
