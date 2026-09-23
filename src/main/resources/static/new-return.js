
const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";

let selectedTaxpayer = null;
let taxpayersList = [];


/* =========================================================
   PAGE INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTaxpayers();

    addProduct();

    const year = document.getElementById("returnYear");

    if (year) {
        year.value = new Date().getFullYear();
    }

    document
        .getElementById("returnForm")
        .addEventListener("submit", submitReturn);
});


/* =========================================================
   LOAD TAXPAYERS
   ========================================================= */

async function loadTaxpayers() {

    try {

        const response = await fetch(
            `${API_BASE}/taxpayers/all`
        );

        if (!response.ok) {
            throw new Error("Failed to load taxpayers");
        }

        taxpayersList = await response.json();

        const select =
            document.getElementById("taxpayerSelect");

        select.innerHTML =
            `<option value="">Select taxpayer</option>`;

        taxpayersList.forEach(taxpayer => {

            const option =
                document.createElement("option");

            option.value = taxpayer.id;

            option.textContent =
                `${taxpayer.taxpayerName} - ${taxpayer.tinNumber}`;

            select.appendChild(option);
        });


        select.addEventListener("change", function () {

            const taxpayer =
                taxpayersList.find(
                    item => item.id == this.value
                );

            if (taxpayer) {
                selectTaxpayer(taxpayer);
            } else {
                clearTaxpayerDetails();
            }

        });

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load taxpayers. " +
            "Please check that the backend is running."
        );
    }
}


/* =========================================================
   SEARCH TAXPAYER BY TIN
   ========================================================= */

async function findTaxpayer() {

    const tin =
        document
            .getElementById("tinNumber")
            .value
            .trim();

    if (!tin) {

        alert("Please enter a TIN number.");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/taxpayers/tinNumber/${encodeURIComponent(tin)}`
        );

        if (!response.ok) {

            alert("Taxpayer not found.");

            clearTaxpayerDetails();

            return;
        }

        const taxpayer = await response.json();

        selectTaxpayer(taxpayer);

    } catch (error) {

        console.error(error);

        alert("Unable to search taxpayer.");

    }
}


/* =========================================================
   SELECT TAXPAYER
   ========================================================= */

function selectTaxpayer(taxpayer) {

    selectedTaxpayer = taxpayer;

    document.getElementById("tinNumber").value =
        taxpayer.tinNumber || "";

    document.getElementById("taxpayerName").value =
        taxpayer.taxpayerName || "";

    document.getElementById("taxpayerAddress").value =
        taxpayer.address || "";

    document.getElementById("taxpayerPhone").value =
        taxpayer.phoneNumber || "";


    const select =
        document.getElementById("taxpayerSelect");

    if (select) {

        select.value =
            taxpayer.id || "";

    }
}


/* =========================================================
   CLEAR TAXPAYER
   ========================================================= */

function clearTaxpayerDetails() {

    selectedTaxpayer = null;

    document.getElementById("tinNumber").value = "";
    document.getElementById("taxpayerName").value = "";
    document.getElementById("taxpayerAddress").value = "";
    document.getElementById("taxpayerPhone").value = "";

}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

function addProduct() {

    const template =
        document.getElementById("productTemplate");

    const container =
        document.getElementById("productsContainer");

    const clone =
        template.content.cloneNode(true);

    container.appendChild(clone);

    updateProductNumbers();

    const productCard =
        container.lastElementChild;

    attachCalculationListeners(productCard);

    calculateProduct(productCard);

    calculateReturnTotals();
}


/* =========================================================
   REMOVE PRODUCT
   ========================================================= */

function removeProduct(button) {

    const productCards =
        document.querySelectorAll(".product-card");

    if (productCards.length === 1) {

        alert(
            "A surtax return must contain at least one product."
        );

        return;
    }

    const card =
        button.closest(".product-card");

    card.remove();

    updateProductNumbers();

    calculateReturnTotals();
}


/* =========================================================
   UPDATE PRODUCT NUMBERS
   ========================================================= */

function updateProductNumbers() {

    const products =
        document.querySelectorAll(".product-card");

    products.forEach((product, index) => {

        const number =
            product.querySelector(".product-number");

        number.textContent =
            `Product ${index + 1}`;

    });
}


/* =========================================================
   ATTACH CALCULATION LISTENERS
   ========================================================= */

function attachCalculationListeners(card) {

    const inputs =
        card.querySelectorAll(
            "input[type='number'], select"
        );

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                calculateProduct(card);

                calculateReturnTotals();

            }
        );

        input.addEventListener(
            "change",
            () => {

                calculateProduct(card);

                calculateReturnTotals();

            }
        );

    });
}


/* =========================================================
   CALCULATE PRODUCT
   ========================================================= */

function calculateProduct(card) {

    const opening =
        getNumber(
            card.querySelector(".opening-stock")
        );

    const receipts =
        getNumber(
            card.querySelector(".external-receipts")
        );

    const production =
        getNumber(
            card.querySelector(".production")
        );

    const dutiable =
        getNumber(
            card.querySelector(".dutiable-disposal")
        );

    const exportsValue =
        getNumber(
            card.querySelector(".exports")
        );

    const destruction =
        getNumber(
            card.querySelector(".destruction")
        );

    const grams =
        getNumber(
            card.querySelector(".declared-grams")
        );


    /* ---------------------------------------------
       TOTAL LITRES
       Opening + Receipts + Production
       --------------------------------------------- */

    const totalLitres =
        opening +
        receipts +
        production;


    card.querySelector(".total-litres").value =
        formatNumber(totalLitres);


    /* ---------------------------------------------
       CLOSING STOCK
       Total - Dutiable - Exports - Destruction
       --------------------------------------------- */

    const closingStock =
        totalLitres -
        dutiable -
        exportsValue -
        destruction;


    card.querySelector(".closing-stock").value =
        formatNumber(closingStock);


    /* ---------------------------------------------
       TOTAL DISPOSED
       Excel = Dutiable Disposal
       --------------------------------------------- */

    const totalDisposed =
        dutiable;


    card.querySelector(".total-disposed").value =
        formatNumber(totalDisposed);


    /* ---------------------------------------------
       TOTAL SUGAR CONTENT
       Total Disposed × Grams/Litre
       --------------------------------------------- */

    const totalSugar =
        totalDisposed *
        grams;


    card.querySelector(".total-sugar").value =
        formatNumber(totalSugar);


    /* ---------------------------------------------
       SURTAX RATE
       --------------------------------------------- */

    const category =
        card.querySelector(".product-category").value;

    let rate = 0;

    if (category === "CORDIALS") {

        rate = 0.0005;

    } else if (category === "READY_TO_DRINK") {

        rate = 0.001;

    }


    card.querySelector(".surtax-rate").value =
        rate.toFixed(4);


    /* ---------------------------------------------
       TOTAL PAYABLE
       --------------------------------------------- */

    const totalPayable =
        totalSugar *
        rate;


    card.querySelector(".total-payable").value =
        formatNumber(totalPayable);

}


/* =========================================================
   CALCULATE RETURN TOTALS
   ========================================================= */
/*

function calculateReturnTotals() {

    let opening = 0;
    let receipts = 0;
    let production = 0;

    let totalLitres = 0;

    let dutiable = 0;
    let exportsValue = 0;
    let destruction = 0;

    let closing = 0;
    let disposed = 0;

    let sugar = 0;
    let payable = 0;


    const products =
        document.querySelectorAll(".product-card");


    products.forEach(card => {

        opening +=
            getNumber(
                card.querySelector(".opening-stock")
            );

        receipts +=
            getNumber(
                card.querySelector(".external-receipts")
            );

        production +=
            getNumber(
                card.querySelector(".production")
            );

        totalLitres +=
            getNumber(
                card.querySelector(".total-litres")
            );

        dutiable +=
            getNumber(
                card.querySelector(".dutiable-disposal")
            );

        exportsValue +=
            getNumber(
                card.querySelector(".exports")
            );

        destruction +=
            getNumber(
                card.querySelector(".destruction")
            );

        closing +=
            getNumber(
                card.querySelector(".closing-stock")
            );

        disposed +=
            getNumber(
                card.querySelector(".total-disposed")
            );

        sugar +=
            getNumber(
                card.querySelector(".total-sugar")
            );

        payable +=
            getNumber(
                card.querySelector(".total-payable")
            );

    });


    document.getElementById(
        "returnTotalOpening"
    ).value = formatNumber(opening);


    document.getElementById(
        "returnTotalReceipts"
    ).value = formatNumber(receipts);


    document.getElementById(
        "returnTotalProduction"
    ).value = formatNumber(production);


    document.getElementById(
        "returnTotalLitres"
    ).value = formatNumber(totalLitres);


    document.getElementById(
        "returnTotalDutiable"
    ).value = formatNumber(dutiable);


    document.getElementById(
        "returnTotalExports"
    ).value = formatNumber(exportsValue);


    document.getElementById(
        "returnTotalDestruction"
    ).value = formatNumber(destruction);


    document.getElementById(
        "returnTotalClosing"
    ).value = formatNumber(closing);


    document.getElementById(
        "returnTotalDisposed"
    ).value = formatNumber(disposed);


    document.getElementById(
        "returnTotalSugar"
    ).value = formatNumber(sugar);


    document.getElementById(
        "returnTotalPayable"
    ).value = formatNumber(payable);

    // Update variance immediately
        calculateVariance();

}
*/

function calculateReturnTotals() {

    let opening = 0;
    let receipts = 0;
    let production = 0;

    let totalLitres = 0;

    let dutiable = 0;
    let exportsValue = 0;
    let destruction = 0;

    let closing = 0;
    let disposed = 0;

    let sugar = 0;
    let payable = 0;

    const products =
        document.querySelectorAll(".product-card");

    products.forEach(card => {

        // Raw input values
        const productOpening =
            getNumber(card.querySelector(".opening-stock"));

        const productReceipts =
            getNumber(card.querySelector(".external-receipts"));

        const productProduction =
            getNumber(card.querySelector(".production"));

        const productDutiable =
            getNumber(card.querySelector(".dutiable-disposal"));

        const productExports =
            getNumber(card.querySelector(".exports"));

        const productDestruction =
            getNumber(card.querySelector(".destruction"));

        // Calculated product values
        const productTotalLitres =
            productOpening +
            productReceipts +
            productProduction;

        const productClosing =
            productTotalLitres -
            productDutiable -
            productExports -
            productDestruction;

        // According to the current calculation,
        // Total Disposed = Dutiable Disposal
        const productDisposed =
            productDutiable;

        const productGrams =
            getNumber(card.querySelector(".declared-grams"));

        const productSugar =
            productDisposed *
            productGrams;

        const productCategory =
            card.querySelector(".product-category").value;

        let productRate = 0;

        if (productCategory === "CORDIALS") {

            productRate = 0.0005;

        } else if (productCategory === "READY_TO_DRINK") {

            productRate = 0.001;

        }

        const productPayable =
            productSugar *
            productRate;


        // Add to return totals
        opening += productOpening;
        receipts += productReceipts;
        production += productProduction;

        totalLitres += productTotalLitres;

        dutiable += productDutiable;
        exportsValue += productExports;
        destruction += productDestruction;

        closing += productClosing;
        disposed += productDisposed;

        sugar += productSugar;
        payable += productPayable;

    });


    // Display totals
    document.getElementById(
        "returnTotalOpening"
    ).value = formatNumber(opening);


    document.getElementById(
        "returnTotalReceipts"
    ).value = formatNumber(receipts);


    document.getElementById(
        "returnTotalProduction"
    ).value = formatNumber(production);


    document.getElementById(
        "returnTotalLitres"
    ).value = formatNumber(totalLitres);


    document.getElementById(
        "returnTotalDutiable"
    ).value = formatNumber(dutiable);


    document.getElementById(
        "returnTotalExports"
    ).value = formatNumber(exportsValue);


    document.getElementById(
        "returnTotalDestruction"
    ).value = formatNumber(destruction);


    document.getElementById(
        "returnTotalClosing"
    ).value = formatNumber(closing);


    document.getElementById(
        "returnTotalDisposed"
    ).value = formatNumber(disposed);


    document.getElementById(
        "returnTotalSugar"
    ).value = formatNumber(sugar);


    document.getElementById(
        "returnTotalPayable"
    ).value = formatNumber(payable);


    // Recalculate variance
    calculateVariance();
}

/* =========================================================
   SUBMIT RETURN
   ========================================================= */

async function submitReturn(event) {

    event.preventDefault();


    if (!selectedTaxpayer) {

        alert(
            "Please select or search for a taxpayer."
        );

        return;
    }


    const productCards =
        document.querySelectorAll(".product-card");


    if (productCards.length === 0) {

        alert(
            "Please add at least one product."
        );

        return;
    }


    const products = [];


    productCards.forEach(card => {

        products.push({

            productName:
                card.querySelector(".product-name").value.trim(),

            productCategory:
                card.querySelector(".product-category").value,

            openingStockOnHand:
                getNumber(
                    card.querySelector(".opening-stock")
                ),

            externalReceipts:
                getNumber(
                    card.querySelector(".external-receipts")
                ),

            production:
                getNumber(
                    card.querySelector(".production")
                ),

            dutiableDisposal:
                getNumber(
                    card.querySelector(".dutiable-disposal")
                ),

            exports:
                getNumber(
                    card.querySelector(".exports")
                ),

            destruction:
                getNumber(
                    card.querySelector(".destruction")
                ),

            declaredGramsPerLitre:
                getNumber(
                    card.querySelector(".declared-grams")
                )

        });

    });


const payments = [];

document
    .querySelectorAll(".payment-row")
    .forEach(row => {

        const amount =
            parseFloat(
                row.querySelector(".payment-amount").value
            ) || 0;

        if (amount > 0) {

            payments.push({

                amount: amount,

                currency:
                    row.querySelector(".payment-currency").value,

                billOfEntry:
                    row.querySelector(".payment-bill-of-entry").value,

                receiptNumber:
                    row.querySelector(".payment-receipt").value,

                assessmentNumber:
                    row.querySelector(".payment-assessment").value

            });
        }
    });



    const payload = {

        taxpayerId:
            selectedTaxpayer.id,

        returnMonth:
            Number(
                document.getElementById(
                    "returnMonth"
                ).value
            ),

        returnYear:
            Number(
                document.getElementById(
                    "returnYear"
                ).value
            ),

        manufacturer:
            selectedTaxpayer.taxpayerName,

        address:
            selectedTaxpayer.address,

        products: products,

         payments: payments

    };

    console.log(JSON.stringify(payload));


    try {

        const response = await fetch(
            `${API_BASE}/surtax-returns/create`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(error);

            alert(
                "Failed to submit the surtax return."
            );

            return;
        }


        const result =
            await response.json();


        alert(
            `Surtax return submitted successfully. Return ID: ${result.id}`
        );


        window.location.href =
            "/returns";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );

    }

}


/* =========================================================
   NUMBER HELPERS
   ========================================================= */

/*function getNumber(element) {

    if (!element) {
        return 0;
    }

    const value =
        parseFloat(element.value);

    return Number.isFinite(value)
        ? value
        : 0;
}*/

function getNumber(element) {

    if (!element) {
        return 0;
    }

    // Remove commas before converting to a number
    const value = parseFloat(
        String(element.value || "")
            .replace(/,/g, "")
            .trim()
    );

    return Number.isFinite(value)
        ? value
        : 0;
}


function formatNumber(value) {

    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }
    );
}


/*ADD PAYMENT*/

function addPayment() {

    const template =
        document.getElementById("paymentTemplate");

    const clone =
        template.content.cloneNode(true);

    document
        .getElementById("paymentsContainer")
        .appendChild(clone);

    updatePaymentNumbers();

    calculateVariance();
}

function removePayment(button) {

    const row =
        button.closest(".payment-row");

    row.remove();

    updatePaymentNumbers();

    calculateVariance();
}
function updatePaymentNumbers() {

    const payments =
        document.querySelectorAll(".payment-row");

    payments.forEach((payment, index) => {

        payment.querySelector(".payment-number")
                .textContent = index + 1;

    });
}

function calculateVariance() {

    const totalPayable =
        getNumber(
            document.getElementById("returnTotalPayable")
        ) || 0;

    let totalPaid = 0;

    document
        .querySelectorAll(".payment-amount")
        .forEach(input => {

            totalPaid +=
                parseFloat(input.value) || 0;

        });

    const variance =
        totalPaid - totalPayable;

    const circle =
        document.getElementById("varianceCircle");

    const amount =
        document.getElementById("varianceAmount");

    const label =
        document.getElementById("varianceLabel");


    amount.textContent =
        formatNumber(variance);


    // ==========================================
    // NO VARIANCE
    // ==========================================

    if (Math.abs(variance) < 0.0001) {

        circle.style.backgroundColor = "#198754";

        label.textContent =
            "Fully Paid";

    }


    // ==========================================
    // NEGATIVE VARIANCE
    // ==========================================

    else if (variance < 0) {

        circle.style.backgroundColor = "#dc3545";

        label.textContent =
            "Underpayment";

    }


    // ==========================================
    // POSITIVE VARIANCE
    // ==========================================

    else {

        circle.style.backgroundColor = "#0d6efd";

        label.textContent =
            "Excess Payment";

    }
}