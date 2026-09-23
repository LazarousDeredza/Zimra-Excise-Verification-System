package com.zimra.excise.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller

public class Home {

    @GetMapping({"/","/home","/index.html"})
    public String viewHomePage() {

        return "index";
    }

    @GetMapping("/new_return")
    public String newReturnPage() {

        return "new-return";
    }

    @GetMapping("/new_taxpayer")
    public String newTaxpayerPage() {

        return "new-taxpayer";
    }

    @GetMapping("/taxpayers")
    public String taxpayers() {

        return "taxpayers";
    }


    @GetMapping("/returns")
    public String returns() {

        return "returns";
    }

    @GetMapping("/view_return")
    public String viewReturn() {

        return "view-return";
    }

    @GetMapping("/view_taxpayer")
    public String viewTaxpayer() {

        return "view-taxpayer";
    }
}
