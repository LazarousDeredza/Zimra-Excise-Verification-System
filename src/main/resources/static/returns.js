
const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";

let selectedTaxpayer = null;


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadReturns();

});


/* =========================================================
   MODAL
   ========================================================= */

function openModal() {

    document.getElementById("modal").classList.add("open");

}


function closeModal() {

    document.getElementById("modal").classList.remove("open");

}


/* =========================================================
   LOAD ALL RETURNS
   ========================================================= */

async function loadReturns() {

    const rows = document.getElementById("rows");

    rows.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                Loading returns...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_BASE}/surtax-returns/all`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load returns"
            );

        }

        const returns = await response.json();

        renderReturns(returns);

        updateStatistics(returns);

    } catch (error) {

        console.error(error);

        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty error">
                    Unable to connect to the server.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   DISPLAY RETURNS
   ========================================================= */

function renderReturns(returns) {

    const rows = document.getElementById("rows");

    if (!returns || returns.length === 0) {

        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    No surtax returns found.
                </td>
            </tr>
        `;

        return;
    }


    rows.innerHTML = returns.map(r => {

        /* ==========================================
           TAXPAYER
           ========================================== */



            const id =
                       r.id ?? "N/A";

        const taxpayerName =
            r.taxpayer?.taxpayerName ?? "N/A";

        const tin =
            r.taxpayer?.tinNumber ?? "N/A";


        /* ==========================================
           RETURN PERIOD
           ========================================== */

        const returnPeriod =
            getReturnPeriod(
                r.returnMonth,
                r.returnYear
            );


        /* ==========================================
           TOTAL PAYABLE
           ========================================== */

        const totalPayable =
            Number(r.totalPayable ?? 0);


        /* ==========================================
           TOTAL PAID
           ========================================== */

        const totalPaid =
            Number(r.totalPaid ?? 0);


        /* ==========================================
           VARIANCE
           ========================================== */

        const variance =
            Number(r.variance ?? 0);


        /* ==========================================
           VARIANCE STYLE
           ========================================== */

        let varianceClass = "";
        let varianceLabel = "";

        if (Math.abs(variance) < 0.0001) {

            varianceClass = "variance-green";
            varianceLabel = "Fully Paid";

        }
        else if (variance < 0) {

            varianceClass = "variance-red";
            varianceLabel = "Underpayment";

        }
        else {

            varianceClass = "variance-blue";
            varianceLabel = "Excess Payment";

        }


        /* ==========================================
           STATUS
           ========================================== */

        const status =
            r.status ?? "PENDING";


        return `

            <tr>

                <!-- TAXPAYER -->
                <td>
                                    <strong>
                                        ${escapeHtml(id)}
                                    </strong>
                                </td>

                <td>
                    <strong>
                        ${escapeHtml(taxpayerName)}
                    </strong>
                </td>


                <!-- TIN -->

                <td>
                    ${escapeHtml(tin)}
                </td>


                <!-- RETURN PERIOD -->

                <td>
                    ${escapeHtml(returnPeriod)}
                </td>


                <!-- TOTAL PAYABLE -->

                <td>
                    <strong>
                        $ ${formatNumber(totalPayable)}
                    </strong>
                </td>


                <!-- TOTAL PAID -->

                <td>
                    <strong>
                        $ ${formatNumber(totalPaid)}
                    </strong>
                </td>


                <!-- VARIANCE -->

                <td>

                    <span
                        class="variance-badge ${varianceClass}"
                        title="${varianceLabel}">

                        ${variance < 0 ? "-" : ""}
                        $ ${formatNumber(Math.abs(variance))}

                    </span>

                </td>


                <!-- STATUS -->

                <td>

                    <span class="status ${status.toLowerCase()}">

                        ${escapeHtml(status)}

                    </span>

                </td>


                <!-- ACTION -->

                <td>

                    <button
                        class="table-btn"
                        onclick="viewReturn(${r.id})">

                        <i class="bi bi-eye"></i>
                        View

                    </button>

                </td>

            </tr>

        `;

    }).join("");

}



function getReturnPeriod(month, year) {

    if (!month || !year) {
        return "-";
    }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return `${months[month - 1]} ${year}`;
}



function viewReturn(id) {

    // Store the selected return ID
    localStorage.setItem(
        "selectedReturnId",
        id
    );

    // Redirect to the return view page
    window.location.href = "/view_return";
}

/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(returns) {

    document.getElementById("total").textContent =
        returns.length;


    const verified = returns.filter(
        r => r.status === "VERIFIED"
    ).length;


    const flagged = returns.filter(
        r =>
            r.status === "FLAGGED" ||
            r.status === "REJECTED"
    ).length;


    const pending = returns.filter(
        r => r.status === "PENDING"
    ).length;


    document.getElementById("verified").textContent =
        verified;

    document.getElementById("flagged").textContent =
        flagged;

    document.getElementById("pending").textContent =
        pending;

}


/* =========================================================
   FIND TAXPAYER BY TIN
   ========================================================= */

async function findTaxpayer() {

    const tin =
        document.getElementById("taxpayerTin").value.trim();

    const message =
        document.getElementById("taxpayerMessage");


    if (!tin) {

        message.innerHTML = `
            <span class="message error">
                Enter a TIN number.
            </span>
        `;

        return;
    }


    message.innerHTML = `
        <span class="message">
            Searching taxpayer...
        </span>
    `;


    try {

        const response = await fetch(
            `${API_BASE}/taxpayers/tinNumber/${encodeURIComponent(tin)}`
        );


        if (!response.ok) {

            throw new Error(
                "Taxpayer not found"
            );

        }


        const taxpayer = await response.json();


        if (!taxpayer) {

            throw new Error(
                "Taxpayer not found"
            );

        }


        selectedTaxpayer = taxpayer;


        document.getElementById("taxpayerName").value =
            taxpayer.taxpayerName ?? "";


        document.getElementById("taxpayerAddress").value =
            taxpayer.address ?? "";


        message.innerHTML = `
            <span class="message success">
                ✓ Taxpayer found
            </span>
        `;


    } catch (error) {

        selectedTaxpayer = null;


        document.getElementById("taxpayerName").value = "";
        document.getElementById("taxpayerAddress").value = "";


        message.innerHTML = `
            <span class="message error">
                ✕ Taxpayer not found
            </span>
        `;

    }

}


/* =========================================================
   CREATE SURTAX RETURN
   ========================================================= */

/*
document
    .getElementById("form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        if (!selectedTaxpayer) {

            alert(
                "Please search and select a valid taxpayer first."
            );

            return;

        }


        const formData =
            new FormData(event.target);


        const returnPeriod =
            formData.get("returnPeriod");


        */
/*
         * HTML month input gives:
         *
         * 2026-05
         *
         * Your backend currently has String returnPeriod,
         * so this can be stored directly.
         *//*



        const data = {

            taxpayer: {
                id: selectedTaxpayer.id
            },

            returnPeriod: returnPeriod,

            productName:
                formData.get("productName"),


            openingStockOnHand:
                Number(
                    formData.get("openingStockOnHand")
                ),


            externalReceipts:
                Number(
                    formData.get("externalReceipts")
                ),


            production:
                Number(
                    formData.get("production")
                ),


            totalLitres:
                Number(
                    formData.get("totalLitres")
                ),


            dutiableDisposal:
                Number(
                    formData.get("dutiableDisposal")
                ),


            exports:
                Number(
                    formData.get("exports")
                ),


            destruction:
                Number(
                    formData.get("destruction")
                ),


            closingStock:
                Number(
                    formData.get("closingStock")
                ),


            totalDisposed:
                Number(
                    formData.get("totalDisposed")
                ),


            totalSugarContent:
                Number(
                    formData.get("totalSugarContent")
                ),


            sugarRate:
                Number(
                    formData.get("sugarRate")
                ),


            totalPayable:
                Number(
                    formData.get("totalPayable")
                )

        };


        try {

            const response = await fetch(
                `${API_BASE}/surtax-returns/create`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(data)

                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(errorText);

                throw new Error(
                    "Failed to create return"
                );

            }


            const created =
                await response.json();


            alert(
                `Surtax return ${created.id} submitted successfully.`
            );


            event.target.reset();

            selectedTaxpayer = null;

            document.getElementById(
                "taxpayerName"
            ).value = "";

            document.getElementById(
                "taxpayerAddress"
            ).value = "";

            document.getElementById(
                "taxpayerMessage"
            ).innerHTML = "";


            closeModal();


            loadReturns();


        } catch (error) {

            console.error(error);

            alert(
                "Failed to submit surtax return. Check that the backend is running."
            );

        }

    });

*/

/* =========================================================
   VIEW ONE RETURN
   ========================================================= */

/*
async function viewReturn(id) {

    try {

        const response = await fetch(
            `${API_BASE}/surtax-returns/${id}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to retrieve return"
            );

        }


        const r =
            await response.json();


        alert(

            `Surtax Return

ID: ${r.id}

Taxpayer:
${r.taxpayer?.taxpayerName ?? "N/A"}

TIN:
${r.taxpayer?.tinNumber ?? "N/A"}

Period:
${r.returnPeriod}

Product:
${r.productName}

Total Litres:
${formatNumber(r.totalLitres)}

Dutiable Disposal:
${formatNumber(r.dutiableDisposal)}

Total Payable:
${formatNumber(r.totalPayable)}

Status:
${r.status}`

        );


    } catch (error) {

        console.error(error);

        alert(
            "Unable to retrieve return."
        );

    }

}

*/

/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {

    if (value === null || value === undefined) {
        return "0.0000";
    }

    return Number(value).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }
    );

}


/* =========================================================
   SECURITY
   ========================================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}