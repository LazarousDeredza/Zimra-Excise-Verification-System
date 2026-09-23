const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadReturn();

});


/* =========================================================
   GET RETURN ID FROM LOCAL STORAGE
   ========================================================= */

function getSelectedReturnId() {

    const returnId =
        localStorage.getItem("selectedReturnId");

    if (!returnId) {

        alert("No return has been selected.");

        window.location.href = "returns.html";

        return null;
    }

    return returnId;
}


/* =========================================================
   LOAD RETURN
   ========================================================= */

async function loadReturn() {

    const returnId =
        getSelectedReturnId();

    if (!returnId) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/surtax-returns/${returnId}`
        );

        if (!response.ok) {

            throw new Error(
                `Failed to load return ${returnId}`
            );

        }

        const returnData =
            await response.json();

        console.log("Return:", returnData);

        displayReturn(returnData);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load the selected return."
        );

    }

}


/* =========================================================
   DISPLAY RETURN
   ========================================================= */

function displayReturn(r) {

    /* =====================================================
       TAXPAYER
       ===================================================== */

    const taxpayer =
        r.taxpayer ?? {};

    setText(
        "taxpayerName",
        taxpayer.taxpayerName
    );

    setText(
        "tinNumber",
        taxpayer.tinNumber
    );

    setText(
        "idNumber",
        taxpayer.idNumber
    );

    setText(
        "phoneNumber",
        taxpayer.phoneNumber
    );

    setText(
        "taxpayerAddress",
        taxpayer.address
    );


    /* =====================================================
       RETURN INFORMATION
       ===================================================== */

    setText(
        "returnId",
        r.id
    );

    setText(
        "returnPeriod",
        getReturnPeriod(
            r.returnMonth,
            r.returnYear
        )
    );

    setText(
        "manufacturer",
        r.manufacturer
    );

    setText(
        "returnAddress",
        r.address
    );

    setText(
        "returnStatus",
        r.status
    );

    setText(
        "submittedAt",
        formatDateTime(r.submittedAt)
    );


    /* =====================================================
       PRODUCTS
       ===================================================== */

    displayProducts(
        r.products ?? []
    );


    /* =====================================================
       PAYMENTS
       ===================================================== */

    displayPayments(
        r.payments ?? []
    );


    /* =====================================================
       FINANCIAL SUMMARY
       ===================================================== */

    const totalPayable =
        Number(r.totalPayable ?? 0);

    const totalPaid =
        Number(r.totalPaid ?? 0);

    const variance =
        Number(r.variance ?? 0);


    setText(
        "totalPayable",
        `USD ${formatNumber(totalPayable)}`
    );

    setText(
        "totalPaid",
        `USD ${formatNumber(totalPaid)}`
    );


    displayVariance(
        variance
    );


    /* =====================================================
       RETURN TOTALS
       ===================================================== */

    setText(
        "totalOpeningStock",
        formatNumber(r.totalOpeningStock)
    );

    setText(
        "totalExternalReceipts",
        formatNumber(r.totalExternalReceipts)
    );

    setText(
        "totalProduction",
        formatNumber(r.totalProduction)
    );

    setText(
        "totalLitres",
        formatNumber(r.totalLitres)
    );

    setText(
        "totalDutiableDisposal",
        formatNumber(r.totalDutiableDisposal)
    );

    setText(
        "totalExports",
        formatNumber(r.totalExports)
    );

    setText(
        "totalDestruction",
        formatNumber(r.totalDestruction)
    );

    setText(
        "totalClosingStock",
        formatNumber(r.totalClosingStock)
    );

    setText(
        "totalDisposed",
        formatNumber(r.totalDisposed)
    );

    setText(
        "totalSugarContent",
        formatNumber(r.totalSugarContent)
    );

}


/* =========================================================
   DISPLAY PRODUCTS
   ========================================================= */

function displayProducts(products) {

    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!products || products.length === 0) {

        container.innerHTML = `
            <tr>
                <td
                    colspan="14"
                    class="empty-message">

                    No products found.

                </td>
            </tr>
        `;

        return;
    }


    container.innerHTML =
        products.map(product => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                product.productName ?? "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            product.productCategory ?? "-"
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.openingStockOnHand
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.externalReceipts
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.production
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.totalLitres
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.dutiableDisposal
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.exports
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.destruction
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.closingStock
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.declaredGramsPerLitre
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            product.totalSugarContent
                        )}
                    </td>

                    <td>
                        ${formatRate(
                            product.surtaxRate
                        )}
                    </td>

                    <td>
                        <strong>
                            USD ${formatNumber(
                                product.totalPayable
                            )}
                        </strong>
                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   DISPLAY PAYMENTS
   ========================================================= */

function displayPayments(payments) {

    const container =
        document.getElementById(
            "paymentsContainer"
        );


    if (!payments || payments.length === 0) {

        container.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="empty-message">

                    No payments recorded.

                </td>
            </tr>
        `;

        return;
    }


    container.innerHTML =
        payments.map(payment => {

            return `

                <tr>

                    <td>
                        <strong>
                            ${formatNumber(
                                payment.amount
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.currency ?? "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.billOfEntry ?? "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.receiptNumber ?? "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            payment.assessmentNumber ?? "-"
                        )}
                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   DISPLAY VARIANCE
   ========================================================= */

function displayVariance(variance) {

    const circle =
        document.getElementById(
            "varianceCircle"
        );

    const amount =
        document.getElementById(
            "varianceAmount"
        );

    const label =
        document.getElementById(
            "varianceLabel"
        );


    circle.classList.remove(
        "variance-green",
        "variance-red",
        "variance-blue"
    );


    if (Math.abs(variance) < 0.0001) {

        circle.classList.add(
            "variance-green"
        );

        amount.textContent =
            `USD ${formatNumber(0)}`;

        label.textContent =
            "Fully Paid";

    }

    else if (variance < 0) {

        circle.classList.add(
            "variance-red"
        );

        amount.textContent =
            `-USD ${formatNumber(
                Math.abs(variance)
            )}`;

        label.textContent =
            "Underpayment";

    }

    else {

        circle.classList.add(
            "variance-blue"
        );

        amount.textContent =
            `USD ${formatNumber(
                variance
            )}`;

        label.textContent =
            "Excess Payment";

    }

}


/* =========================================================
   SHOW PAYMENT FORM
   ========================================================= */

function showPaymentForm() {

    document.getElementById(
        "paymentForm"
    ).style.display = "block";

}


/* =========================================================
   HIDE PAYMENT FORM
   ========================================================= */

function hidePaymentForm() {

    document.getElementById(
        "paymentForm"
    ).style.display = "none";

    clearPaymentForm();

}


/* =========================================================
   ADD PAYMENT
   ========================================================= */

async function addPayment() {

    const returnId =
        getSelectedReturnId();

    if (!returnId) {
        return;
    }


    const amount =
        parseFloat(
            document.getElementById(
                "paymentAmount"
            ).value
        );


    const currency =
        document.getElementById(
            "paymentCurrency"
        ).value;


    const billOfEntry =
        document.getElementById(
            "paymentBillOfEntry"
        ).value.trim();


    const receiptNumber =
        document.getElementById(
            "paymentReceiptNumber"
        ).value.trim();


    const assessmentNumber =
        document.getElementById(
            "paymentAssessmentNumber"
        ).value.trim();


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!amount || amount <= 0) {

        alert(
            "Please enter a valid payment amount."
        );

        return;
    }


    const payment = {

        amount: amount,

        currency: currency,

        billOfEntry: billOfEntry,

        receiptNumber: receiptNumber,

        assessmentNumber: assessmentNumber

    };


    console.log(
        "Submitting payment:",
        payment
    );


    try {

        const response = await fetch(
            `${API_BASE}/surtax-returns/${returnId}/payments`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    payment
                )

            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to add payment"
            );

        }


        alert(
            "Payment added successfully."
        );


        /* =================================================
           CLEAR FORM
           ================================================= */

        clearPaymentForm();

        hidePaymentForm();


        /* =================================================
           RELOAD RETURN
           ================================================= */

        await loadReturn();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to add payment: " +
            error.message
        );

    }

}


/* =========================================================
   CLEAR PAYMENT FORM
   ========================================================= */

function clearPaymentForm() {

    document.getElementById(
        "paymentAmount"
    ).value = "";

    document.getElementById(
        "paymentCurrency"
    ).value = "USD";

    document.getElementById(
        "paymentBillOfEntry"
    ).value = "";

    document.getElementById(
        "paymentReceiptNumber"
    ).value = "";

    document.getElementById(
        "paymentAssessmentNumber"
    ).value = "";

}


/* =========================================================
   BACK TO RETURNS
   ========================================================= */

function goBack() {

    window.location.href =
        "/returns";

}


/* =========================================================
   RETURN PERIOD
   ========================================================= */

function getReturnPeriod(
    month,
    year
) {

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


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(value) {

    return Number(
        value ?? 0
    ).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }
    );

}


/* =========================================================
   FORMAT RATE
   ========================================================= */

function formatRate(value) {

    return Number(
        value ?? 0
    ).toFixed(4);

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    return date.toLocaleString();

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        value ?? "-";

}






/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}