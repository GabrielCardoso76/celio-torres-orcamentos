document.getElementById('currentDate').innerText = new Date().toLocaleDateString('pt-BR');

function addRow() {
    const tbody = document.getElementById('itemsBody');
    const newRow = document.createElement('tr');
    newRow.className = 'text-gray-700 item-row';
    newRow.innerHTML = `
        <td class="py-3 px-2">
            <input type="text" class="input-table font-semibold text-sm" placeholder="Novo Serviço...">
            <input type="text" class="input-table text-[11px] text-gray-500 mt-0.5" placeholder="Detalhes...">
        </td>
        <td class="py-3 px-2">
            <input type="number" value="1" oninput="calculate()" class="qty input-num text-center">
        </td>
        <td class="py-3 px-2">
            <input type="number" value="0.00" oninput="calculate()" class="price input-num text-right">
        </td>
        <td class="py-3 px-2 text-right font-bold text-slate-900 text-sm subtotal">R$ 0,00</td>
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
