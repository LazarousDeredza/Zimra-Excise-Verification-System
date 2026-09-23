const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";



// Load taxpayers when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadTaxpayers();
});


async function loadTaxpayers() {

    const rows = document.getElementById("taxpayerRows");

    rows.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                Loading taxpayers…
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_BASE}/taxpayers/all`
        );

        if (!response.ok) {
            throw new Error("Failed to load taxpayers");
        }

        const taxpayers = await response.json();

        displayTaxpayers(taxpayers);

    } catch (error) {

        console.error(error);

        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Unable to load taxpayers.
                    Please make sure the Spring Boot server is running.
                </td>
            </tr>
        `;
    }
}


function displayTaxpayers(taxpayers) {

    const rows = document.getElementById("taxpayerRows");

    document.getElementById("totalTaxpayers").textContent =
        taxpayers.length;


    let taxpayersWithReturns = 0;
    let totalReturns = 0;


    if (!taxpayers || taxpayers.length === 0) {

        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No taxpayers have been registered yet.
                </td>
            </tr>
        `;

        document.getElementById("taxpayersWithReturns").textContent = 0;
        document.getElementById("totalReturns").textContent = 0;

        return;
    }


    rows.innerHTML = taxpayers.map((taxpayer, index) => {

        const returnCount =
            taxpayer.returns
                ? taxpayer.returns.length
                : 0;


        if (returnCount > 0) {
            taxpayersWithReturns++;
        }

        totalReturns += returnCount;


        return `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(taxpayer.taxpayerName || "-")}
                    </strong>
                </td>

                <td>
                    <span class="tin">
                        ${escapeHtml(taxpayer.tinNumber || "-")}
                    </span>
                </td>

                <td>
                    ${escapeHtml(taxpayer.address || "-")}
                </td>

                <td>
                    ${escapeHtml(taxpayer.phoneNumber || "-")}
                </td>
                 <td>
                                    ${escapeHtml(taxpayer.email || "-")}
                                </td>


                <td>
                    <span class="return-count">
                        ${returnCount}
                        ${returnCount === 1 ? "Return" : "Returns"}
                    </span>
                </td>

                <td>

                    <button
                            class="table-action"
                            onclick="viewTaxpayer(${taxpayer.id})">

                        View

                    </button>

                </td>

            </tr>
        `;

    }).join("");


    document.getElementById("taxpayersWithReturns").textContent =
        taxpayersWithReturns;

    document.getElementById("totalReturns").textContent =
        totalReturns;
}


function viewTaxpayer(id) {

    localStorage.setItem(
        "selectedTaxpayerId",
        id
    );

    window.location.href =
        "/view_taxpayer";
}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}