package com.zimra.excise.controller;

import com.zimra.excise.dto.TaxpayerDto;
import com.zimra.excise.entity.Taxpayer;
import com.zimra.excise.service.TaxpayerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/taxpayers")
@CrossOrigin(origins = "*")
public class TaxpayerController {

    private final TaxpayerService s;

    public TaxpayerController(TaxpayerService s) {
        this.s = s;
    }


        @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Taxpayer create(@RequestBody Taxpayer taxpayer) {

            System.out.println("taxpayer : "+taxpayer.toString());

        if (s.existsByTinNumber(taxpayer.getTin())) {

            throw new RuntimeException(
                    "A taxpayer with TIN "
                            + taxpayer.getTin()
                            + " already exists."
            );
        }

        return s.create(taxpayer);
    }


    @GetMapping("/all")
    public ResponseEntity<List<TaxpayerDto>> getAllTaxpayers() {

        return ResponseEntity.ok(
                s.getAllTaxpayers()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<TaxpayerDto> getTaxpayerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                s.getTaxpayerById(id)
        );
    }


    @GetMapping("/tinNumber/{tin}")
    public Optional<Taxpayer> oneByTin(
            @PathVariable String tin) {

        return s.getByTinNumber(tin);
    }
}