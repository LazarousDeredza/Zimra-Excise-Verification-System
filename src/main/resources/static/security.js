const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", function () {

    loadLoggedInOfficer();

});


function loadLoggedInOfficer() {

    fetch(`${API_BASE_URL}/current-user`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load current user");
            }

            return response.json();

        })

        .then(user => {

            console.log("Logged in officer:", user);


            // Display name/email

            const userName =
                document.getElementById("userName");

            const userRole =
                document.getElementById("userRole");

            const userAvatar =
                document.getElementById("userAvatar");


            if (userName) {

                userName.textContent =
                    user.name;

            }


            if (userRole) {

                userRole.textContent =
                    formatRole(user.role);

            }


            if (userAvatar) {

                userAvatar.textContent =
                    getInitials(user.name);

            }

        })

        .catch(error => {

            console.error(
                "Error loading logged in officer:",
                error
            );

        });

}


function formatRole(role) {

    if (!role) {
        return "Revenue Officer";
    }

    return role
        .toLowerCase()
        .split("_")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");

}


function getInitials(name) {

    if (!name) {
        return "--";
    }

    const parts =
        name.trim().split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}


function toggleUserMenu() {

    const menu = document.getElementById("userMenu");

    if (!menu) {
        return;
    }

    menu.classList.toggle("show");
}


// Close menu when clicking outside

document.addEventListener("click", function (event) {

    const menu = document.getElementById("userMenu");

    const button =
        document.querySelector(".user-menu-button");

    if (!menu || !button) {
        return;
    }

    if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ) {

        menu.classList.remove("show");

    }

});