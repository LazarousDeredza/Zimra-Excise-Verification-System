package com.zimra.excise.security.controller;




import com.zimra.excise.security.entity.User;
import com.zimra.excise.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Controller;

import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;


    // ==============================
    // LOGIN PAGE
    // ==============================

    @GetMapping("/login")
    public String login() {

        return "login";

    }


    // ==============================
    // SIGNUP PAGE
    // ==============================

    @GetMapping("/signup")
    public String signup() {

        return "signup";

    }


    // ==============================
    // REGISTER USER
    // ==============================

    @PostMapping("/register")
    public String register(

            @RequestParam String name,

            @RequestParam String email,

            @RequestParam String password) {


        // Check whether email already exists

        if (userRepository.existsByEmail(email)) {

            return "redirect:/signup.html?error=exists";

        }


        // Create user

        User user = User.builder()

                .name(name)

                .email(email)

                .password(
                        passwordEncoder.encode(password)
                )

                .role("USER")

                .build();


        userRepository.save(user);


        return "redirect:/login?registered=true";
    }
}