const API_BASE = "http://localhost:8080/api";
//const API_BASE = "https://q99mwttn-8080.uks1.devtunnels.ms/api";


document
    .getElementById("taxpayerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const form = event.target;

        const message =
            document.getElementById("message");


        const taxpayer = {

            taxpayerName:
                form.taxpayerName.value.trim(),

            address:
                form.address.value.trim(),

            tin:
                form.tinNumber.value.trim(),

            phoneNumber:
                form.phoneNumber.value.trim(),

            idNumber:
                form.idNumber.value.trim(),
                email:
                                form.email.value.trim()
        };

        console.log(JSON.stringify(taxpayer));


        try {

            message.className = "form-message";

            message.textContent =
                "Saving taxpayer...";


            const response = await fetch(
                `${API_BASE}/taxpayers/create`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(taxpayer)
                }
            );


            if (!response.ok) {

                let errorMessage =
                    "Failed to create taxpayer.";

                try {

                    const error =
                        await response.json();

                    if (error.message) {
                        errorMessage =
                            error.message;
                    }

                } catch (e) {
                    // Ignore JSON parsing error
                }

                throw new Error(errorMessage);
            }


            const savedTaxpayer =
                await response.json();


            message.className =
                "form-message success-message";

            message.textContent =
                `Taxpayer "${savedTaxpayer.taxpayerName}" was successfully registered.`;


            form.reset();


            setTimeout(() => {

                window.location.href =
                    "/taxpayers";

            }, 1000);


        } catch (error) {

            console.error(error);

            message.className =
                "form-message error-message";

            message.textContent =
                error.message ||
                "An error occurred while saving the taxpayer.";

        }

    });