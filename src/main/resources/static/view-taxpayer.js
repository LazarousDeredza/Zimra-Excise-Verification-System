const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTaxpayer();

    }
);


function getSelectedTaxpayerId() {

    const taxpayerId =
        localStorage.getItem(
            "selectedTaxpayerId"
        );

    if (!taxpayerId) {

        alert(
            "No taxpayer has been selected."
        );

        window.location.href =
            "taxpayers.html";

        return null;
    }

    return taxpayerId;
}


async function loadTaxpayer() {

    const taxpayerId =
        getSelectedTaxpayerId();

    if (!taxpayerId) {
        return;
    }


    const rows =
        document.getElementById(
            "returnRows"
        );


    rows.innerHTML = `
        <tr>
            <td colspan="8" class="empty">
                Loading taxpayer information…
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE}/taxpayers/${taxpayerId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load taxpayer"
            );

        }


        const taxpayer =
            await response.json();


        displayTaxpayer(taxpayer);


    } catch (error) {

        console.error(error);


        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Unable to load taxpayer information.
                </td>
            </tr>
        `;

    }

}

function displayTaxpayer(taxpayer) {

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

    setText(
        "taxpayerId",
        taxpayer.id
    );


    const returns =
        taxpayer.returns ?? [];


    document.getElementById(
        "totalReturns"
    ).textContent =
        returns.length;


    let totalPayable = 0;
    let totalPaid = 0;


    returns.forEach(r => {

        totalPayable +=
            Number(r.totalPayable ?? 0);

        totalPaid +=
            Number(r.totalPaid ?? 0);

    });


    document.getElementById(
        "totalPayable"
    ).textContent =
        `USD ${formatNumber(totalPayable)}`;


    document.getElementById(
        "totalPaid"
    ).textContent =
        `USD ${formatNumber(totalPaid)}`;


    displayReturns(returns);

}

function displayReturns(returns) {

    const rows =
        document.getElementById(
            "returnRows"
        );


    if (!returns || returns.length === 0) {

        rows.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    This taxpayer has no submitted returns.
                </td>
            </tr>
        `;

        return;
    }


    rows.innerHTML =
        returns.map((r, index) => {

            const payable =
                Number(
                    r.totalPayable ?? 0
                );

            const paid =
                Number(
                    r.totalPaid ?? 0
                );

            const variance =
                Number(
                    r.variance ?? 0
                );


            let varianceClass;
            let varianceText;


            if (
                Math.abs(variance) < 0.0001
            ) {

                varianceClass =
                    "variance-green";

                varianceText =
                    "Fully Paid";

            } else if (variance < 0) {

                varianceClass =
                    "variance-red";

                varianceText =
                    "Underpayment";

            } else {

                varianceClass =
                    "variance-blue";

                varianceText =
                    "Excess Payment";

            }


            const status =
                r.status ?? "PENDING";


            return `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                getReturnPeriod(
                                    r.returnMonth,
                                    r.returnYear
                                )
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            r.manufacturer ?? "-"
                        )}
                    </td>

                    <td>
                        <strong>
                            USD ${formatNumber(payable)}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            USD ${formatNumber(paid)}
                        </strong>
                    </td>

                    <td>

                        <span
                            class="variance-badge ${varianceClass}"
                            title="${varianceText}">

                            ${variance < 0 ? "-" : ""}

                            USD
                            ${formatNumber(
                                Math.abs(variance)
                            )}

                        </span>

                    </td>

                    <td>

                        <span
                            class="status ${status.toLowerCase()}">

                            ${escapeHtml(status)}

                        </span>

                    </td>

                    <td>

                        <button
                            class="table-action"
                            onclick="viewReturn(${r.id})">

                            View

                        </button>

                    </td>

                </tr>
            `;

        }).join("");

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


function setText(elementId, value) {

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


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    const div =
        document.createElement("div");


    div.textContent = value;


    return div.innerHTML;

}


function goBack() {

    window.location.href =
        "/taxpayers";

}