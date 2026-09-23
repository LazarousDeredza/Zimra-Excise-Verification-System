const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";

let returnsData = [];
let taxpayersData = [];

let collectionsChart = null;
let statusChart = null;
let monthlyCollectionsChart = null;
let varianceChart = null;
let productChart = null;
let returnsYearChart = null;

// ========================================
// PAGE LOAD
// ========================================

document.addEventListener("DOMContentLoaded", () => {


loadDashboard();


});

// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {


try {

    showLoading();


    const [
        returnsResponse,
        taxpayersResponse
    ] = await Promise.all([

        fetch(
            `${API_BASE}/surtax-returns/all`
        ),

        fetch(
            `${API_BASE}/taxpayers/all`
        )

    ]);


    if (!returnsResponse.ok) {

        throw new Error(
            "Failed to load surtax returns."
        );

    }


    if (!taxpayersResponse.ok) {

        throw new Error(
            "Failed to load taxpayers."
        );

    }


    returnsData =
        await returnsResponse.json();


    taxpayersData =
        await taxpayersResponse.json();


    calculateDashboard();


    document.getElementById(
        "lastUpdated"
    ).textContent =
        "Updated " +
        new Date().toLocaleTimeString(
            "en-ZW",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


} catch (error) {

    console.error(
        "Dashboard error:",
        error
    );

    showDashboardError(
        error.message
    );

}


}

// ========================================
// CALCULATE DASHBOARD
// ========================================

function calculateDashboard() {


const totalReturns =
    returnsData.length;


const totalTaxpayers =
    taxpayersData.length;


// ====================================
// TOTAL PAID
// ====================================

const totalPaid =
    returnsData.reduce(
        (sum, item) => {

            return sum +
                Number(
                    item.totalPaid || 0
                );

        },
        0
    );


// ====================================
// TOTAL PAYABLE
//
// The API has totalPayable = 0
// at return level, so calculate it
// from products.
// ====================================

const totalPayable =
    returnsData.reduce(
        (sum, item) => {

            const products =
                Array.isArray(item.products)
                    ? item.products
                    : [];


            const payable =
                products.reduce(
                    (
                        productSum,
                        product
                    ) => {

                        return productSum +
                            Number(
                                product.totalPayable || 0
                            );

                    },
                    0
                );


            return sum + payable;

        },
        0
    );


// ====================================
// TOTAL LITRES
// ====================================

const totalLitres =
    returnsData.reduce(
        (sum, item) => {

            const products =
                Array.isArray(item.products)
                    ? item.products
                    : [];


            const litres =
                products.reduce(
                    (
                        productSum,
                        product
                    ) => {

                        return productSum +
                            Number(
                                product.totalLitres || 0
                            );

                    },
                    0
                );


            return sum + litres;

        },
        0
    );


// ====================================
// VARIANCES
// ====================================

let positiveVariance = 0;

let negativeVariance = 0;


returnsData.forEach(item => {

    const variance =
        Number(
            item.variance || 0
        );


    if (variance > 0) {

        positiveVariance += variance;

    }


    if (variance < 0) {

        negativeVariance +=
            Math.abs(variance);

    }

});


// ====================================
// STATUS
// ====================================

const verified =
    returnsData.filter(
        item =>
            String(item.status)
                .toUpperCase() ===
            "VERIFIED"
    ).length;


const flagged =
    returnsData.filter(
        item => {

            const status =
                String(item.status)
                    .toUpperCase();

            return (
                status === "FLAGGED" ||
                status === "REJECTED"
            );

        }
    ).length;


const pending =
    returnsData.filter(
        item =>
            String(item.status)
                .toUpperCase() ===
            "PENDING"
    ).length;


// ====================================
// UPDATE MAIN KPIs
// ====================================

setText(
    "totalReturns",
    formatNumber(totalReturns)
);


setText(
    "totalTaxpayers",
    formatNumber(totalTaxpayers)
);


setText(
    "totalAmountPaid",
    formatAmount(totalPaid)
);


setText(
    "negativeVariance",
    formatAmount(negativeVariance)
);


setText(
    "positiveVariance",
    formatAmount(positiveVariance)
);


// ====================================
// UPDATE STATUS KPIs
// ====================================

setText(
    "verified",
    formatNumber(verified)
);


setText(
    "flagged",
    formatNumber(flagged)
);


setText(
    "pending",
    formatNumber(pending)
);


setText(
    "totalPayable",
    formatAmount(totalPayable)
);


// ====================================
// REVENUE SUMMARY
// ====================================

setText(
    "summaryPayable",
    formatAmount(totalPayable)
);


setText(
    "summaryPaid",
    formatAmount(totalPaid)
);


setText(
    "summaryPositive",
    formatAmount(positiveVariance)
);


setText(
    "summaryNegative",
    formatAmount(negativeVariance)
);


setText(
    "summaryLitres",
    formatAmount(totalLitres)
);


// ====================================
// BUILD CHARTS
// ====================================

buildCollectionsChart();

buildStatusChart(
    verified,
    flagged,
    pending
);

buildMonthlyCollectionsChart();

buildVarianceChart(
    positiveVariance,
    negativeVariance
);

buildProductChart();

buildReturnsYearChart();


}

// ========================================
// ANNUAL COLLECTIONS
// ========================================

function buildCollectionsChart() {


const yearlyCollections = {};


returnsData.forEach(item => {

    const year =
        Number(item.returnYear);


    if (!year) {
        return;
    }


    const paid =
        Number(
            item.totalPaid || 0
        );


    if (!yearlyCollections[year]) {

        yearlyCollections[year] = 0;

    }


    yearlyCollections[year] += paid;

});


const years =
    Object.keys(
        yearlyCollections
    )
    .map(Number)
    .sort(
        (a, b) => a - b
    );


const values =
    years.map(
        year =>
            yearlyCollections[year]
    );


const canvas =
    document.getElementById(
        "collectionsChart"
    );


if (collectionsChart) {

    collectionsChart.destroy();

}


collectionsChart =
    new Chart(
        canvas,
        {

            type: "line",

            data: {

                labels: years,

                datasets: [{

                    label:
                        "Amount Paid",

                    data: values,

                    borderColor:
                        "#175CD3",

                    backgroundColor:
                        "rgba(23, 92, 211, 0.10)",

                    borderWidth: 3,

                    fill: true,

                    tension: 0.35,

                    pointRadius: 5,

                    pointHoverRadius: 7

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    intersect: false,

                    mode: "index"

                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    return (
                                        " Paid: " +
                                        formatAmount(
                                            context.raw
                                        )
                                    );

                                }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return formatAmount(
                                        value
                                    );

                                }

                        }

                    }

                }

            }

        }
    );


}

// ========================================
// STATUS DOUGHNUT
// ========================================

function buildStatusChart(
verified,
flagged,
pending
) {


const canvas =
    document.getElementById(
        "statusChart"
    );


if (statusChart) {

    statusChart.destroy();

}


statusChart =
    new Chart(
        canvas,
        {

            type: "doughnut",

            data: {

                labels: [
                    "Verified",
                    "Flagged",
                    "Pending"
                ],

                datasets: [{

                    data: [
                        verified,
                        flagged,
                        pending
                    ],

                    backgroundColor: [
                        "#12B76A",
                        "#F79009",
                        "#667085"
                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",

                plugins: {

                    legend: {

                        position:
                            "bottom",

                        labels: {

                            padding: 18,

                            usePointStyle:
                                true

                        }

                    }

                }

            }

        }
    );


}

// ========================================
// MONTHLY COLLECTIONS
// ========================================

function buildMonthlyCollectionsChart() {


const monthlyCollections = {};


returnsData.forEach(item => {

    const year =
        Number(item.returnYear);


    const month =
        Number(item.returnMonth);


    if (!year || !month) {
        return;
    }


    const key =
        `${year}-${String(month).padStart(2, "0")}`;


    const paid =
        Number(
            item.totalPaid || 0
        );


    if (!monthlyCollections[key]) {

        monthlyCollections[key] = 0;

    }


    monthlyCollections[key] += paid;

});


const months =
    Object.keys(
        monthlyCollections
    )
    .sort();


const values =
    months.map(
        month =>
            monthlyCollections[month]
    );


const canvas =
    document.getElementById(
        "monthlyCollectionsChart"
    );


if (monthlyCollectionsChart) {

    monthlyCollectionsChart.destroy();

}


monthlyCollectionsChart =
    new Chart(
        canvas,
        {

            type: "bar",

            data: {

                labels: months,

                datasets: [{

                    label:
                        "Amount Paid",

                    data: values,

                    backgroundColor:
                        "#175CD3",

                    borderRadius: 6,

                    maxBarThickness: 45

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return formatAmount(
                                        value
                                    );

                                }

                        }

                    }

                }

            }

        }
    );


}

// ========================================
// VARIANCE CHART
// ========================================

function buildVarianceChart(
positive,
negative
) {


const canvas =
    document.getElementById(
        "varianceChart"
    );


if (varianceChart) {

    varianceChart.destroy();

}


varianceChart =
    new Chart(
        canvas,
        {

            type: "bar",

            data: {

                labels: [
                    "Positive Variance",
                    "Negative Variance"
                ],

                datasets: [{

                    data: [
                        positive,
                        negative
                    ],

                    backgroundColor: [
                        "#12B76A",
                        "#F04438"
                    ],

                    borderRadius: 7,

                    maxBarThickness: 70

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return formatAmount(
                                        value
                                    );

                                }

                        }

                    }

                }

            }

        }
    );


}

// ========================================
// PRODUCT CATEGORY CHART
// ========================================

function buildProductChart() {


const categories = {};


returnsData.forEach(item => {

    const products =
        Array.isArray(item.products)
            ? item.products
            : [];


    products.forEach(product => {

        const category =
            product.productCategory ||
            "Unclassified";


        if (!categories[category]) {

            categories[category] = 0;

        }


        categories[category]++;

    });

});


const labels =
    Object.keys(categories);


const values =
    labels.map(
        category =>
            categories[category]
    );


const canvas =
    document.getElementById(
        "productChart"
    );


if (productChart) {

    productChart.destroy();

}


productChart =
    new Chart(
        canvas,
        {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor: [
                        "#175CD3",
                        "#12B76A",
                        "#F79009",
                        "#7F56D9",
                        "#F04438",
                        "#667085"
                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {

                    legend: {

                        position:
                            "bottom",

                        labels: {

                            padding: 15,

                            usePointStyle:
                                true

                        }

                    }

                }

            }

        }
    );


}

// ========================================
// RETURNS BY YEAR
// ========================================

function buildReturnsYearChart() {


const yearlyReturns = {};


returnsData.forEach(item => {

    const year =
        Number(item.returnYear);


    if (!year) {
        return;
    }


    if (!yearlyReturns[year]) {

        yearlyReturns[year] = 0;

    }


    yearlyReturns[year]++;

});


const years =
    Object.keys(yearlyReturns)
        .map(Number)
        .sort(
            (a, b) => a - b
        );


const values =
    years.map(
        year =>
            yearlyReturns[year]
    );


const canvas =
    document.getElementById(
        "returnsYearChart"
    );


if (returnsYearChart) {

    returnsYearChart.destroy();

}


returnsYearChart =
    new Chart(
        canvas,
        {

            type: "bar",

            data: {

                labels: years,

                datasets: [{

                    label:
                        "Returns",

                    data: values,

                    backgroundColor:
                        "#7F56D9",

                    borderRadius: 7,

                    maxBarThickness: 50

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        }
    );


}

// ========================================
// HELPERS
// ========================================

function setText(
elementId,
value
) {


const element =
    document.getElementById(
        elementId
    );


if (element) {

    element.textContent =
        value;

}


}

function formatNumber(value) {


return new Intl.NumberFormat(
    "en-ZW"
).format(value);


}

function formatAmount(value) {


return new Intl.NumberFormat(
    "en-ZW",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
).format(value);


}

function showLoading() {


setText(
    "lastUpdated",
    "Loading..."
);


}

function showDashboardError(message) {


setText(
    "lastUpdated",
    "Dashboard error"
);

console.error(
    message
);


}
