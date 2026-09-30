package com.zimra.excise.security.controller;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CurrentUserController {

    @GetMapping("/api/current-user")
    public Map<String, String> getCurrentUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return Map.of(
                    "name", "",
                    "email", "",
                    "role", ""
            );
        }

        String email = authentication.getName();

        String role = authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("USER");

        return Map.of(
                "name", email,
                "email", email,
                "role", role
        );
    }
}
