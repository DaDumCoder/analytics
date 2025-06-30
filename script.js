document.addEventListener("DOMContentLoaded", function () {
    const totalTxEl = document.getElementById('totalTransactions');
    const totalTransfersEl = document.getElementById('totalTransfers');
    const totalGasEl = document.getElementById('totalGasUsed');
    const totalInteractionsEl = document.getElementById('totalInteractions');
    const totalClaimsEl = document.getElementById('totalClaims');

    if (!totalTxEl || !totalTransfersEl || !totalGasEl || !totalInteractionsEl || !totalClaimsEl) {
        console.error("One or more elements not found in HTML");
        return;
    }

    // Dummy update simulation
    totalTxEl.innerText = "123";
    totalTransfersEl.innerText = "100";
    totalGasEl.innerText = "50,000";
    totalInteractionsEl.innerText = "223";
    totalClaimsEl.innerText = "45";
});
