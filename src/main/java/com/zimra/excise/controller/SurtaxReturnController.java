package com.zimra.excise.controller;

import com.zimra.excise.dto.PaymentRequest;
import com.zimra.excise.dto.SurtaxReturnRequest;
import com.zimra.excise.dto.SurtaxReturnResponse;
import com.zimra.excise.service.SurtaxReturnService;
import com.zimra.excise.service.TaxpayerService;
import jakarta.validation.Valid;
import com.zimra.excise.entity.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surtax-returns")
@CrossOrigin(origins = "*")
public class SurtaxReturnController {
    private final SurtaxReturnService surtaxReturnService;
    private final TaxpayerService taxpayerService;

    public SurtaxReturnController(SurtaxReturnService surtaxReturnService, TaxpayerService taxpayerService) {
        this.surtaxReturnService = surtaxReturnService;
        this.taxpayerService = taxpayerService;
    }


    //Create a return

    @PostMapping("/create")
    public ResponseEntity<SurtaxReturnResponse> create(
            @RequestBody SurtaxReturnRequest request) {

        return ResponseEntity.ok(
                surtaxReturnService.create(request)
        );


    }

    //Add payment to a return
    @PostMapping("/{returnId}/payments")
    public ResponseEntity<SurtaxReturnResponse> addPayment(
            @PathVariable Long returnId,
            @RequestBody PaymentRequest request) {

        return ResponseEntity.ok(
                surtaxReturnService.addPayment(
                        returnId,
                        request
                )
        );
    }


    //Fetch All Returns

    @GetMapping("/all")
    public List<SurtaxReturnResponse> all() {
        return surtaxReturnService.getAll();
    }



    //Fetch Return By ID
    @GetMapping("/{id}")
    public ResponseEntity<SurtaxReturnResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                surtaxReturnService.getById(id)
        );
    }


    @GetMapping("/taxpayer/{tinNumber}")
    public List<SurtaxReturn> getAllReturnsByTinNumber(
            @PathVariable Long tinNumber) {

        return surtaxReturnService.getAllByTinNumber(tinNumber);
    }



}
