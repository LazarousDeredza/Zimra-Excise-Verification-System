package com.zimra.excise.service;

import com.zimra.excise.dto.TaxpayerDto;
import com.zimra.excise.entity.Taxpayer;
import com.zimra.excise.repository.TaxpayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TaxpayerService 
{


    private final TaxpayerRepository  taxpayerRepository;

    public TaxpayerService(TaxpayerRepository taxpayerRepository) {
        this.taxpayerRepository = taxpayerRepository;
    }


    // =========================================================
    // FIND ONE
    // =========================================================

    public Taxpayer getById(Long id) {

        return taxpayerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Surtax return not found with ID: " + id
                        )
                );
    }


    // =========================================================
    // FIND ALL
    // =========================================================


    @Transactional(readOnly = true)
    public List<TaxpayerDto> getAllTaxpayers() {

        return taxpayerRepository
                .findAllWithReturns()
                .stream()
                .map(this::convertToDto)
                .toList();
    }



    //GET 1 TAXPAYER AND HIS RETURNS
    @Transactional(readOnly = true)
    public TaxpayerDto getTaxpayerById(Long id) {

        Taxpayer taxpayer =
                taxpayerRepository.findByIdWithReturns(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Taxpayer not found with ID: " + id
                                )
                        );

        return convertToDto(taxpayer);
    }




    private TaxpayerDto convertToDto(Taxpayer taxpayer) {

        List<TaxpayerDto.ReturnSummaryDto> returns =
                taxpayer.getReturns() == null
                        ? List.of()
                        : taxpayer.getReturns()
                        .stream()
                        .map(returnEntity ->
                                TaxpayerDto.ReturnSummaryDto.builder()
                                        .id(returnEntity.getId())
                                        .returnMonth(
                                                returnEntity.getReturnMonth()
                                        )
                                        .returnYear(
                                                returnEntity.getReturnYear()
                                        )
                                        .manufacturer(
                                                returnEntity.getManufacturer()
                                        )
                                        .address(
                                                returnEntity.getAddress()
                                        )
                                        .totalPayable(
                                                returnEntity.getTotalPayable()
                                        )
                                        .totalPaid(
                                                returnEntity.getTotalPaid()
                                        )
                                        .variance(
                                                returnEntity.getVariance()
                                        )
                                        .status(
                                                returnEntity.getStatus() != null
                                                        ? returnEntity.getStatus().name()
                                                        : null
                                        )
                                        .submittedAt(
                                                returnEntity.getSubmittedAt()
                                        )
                                        .build()
                        )
                        .toList();

        return TaxpayerDto.builder()
                .id(taxpayer.getId())
                .taxpayerName(taxpayer.getTaxpayerName())
                .address(taxpayer.getAddress())
                .tinNumber(taxpayer.getTin())
                .phoneNumber(taxpayer.getPhoneNumber())
                .idNumber(taxpayer.getIdNumber())
                .createdAt(taxpayer.getCreatedAt())
                .updatedAt(taxpayer.getUpdatedAt())
                .email(taxpayer.getEmail())
                .returns(returns)
                .build();
    }

    // =========================================================
    // ADD / CREATE
    // =========================================================

    public Taxpayer create(Taxpayer taxpayer) {

        return taxpayerRepository.save(taxpayer);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    public Taxpayer update(Long id, Taxpayer taxpayer) {

        Taxpayer existingReturn = taxpayerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Surtax return not found with ID: " + id
                        )
                );

        // Set the fields you want to update
        
        existingReturn.setTaxpayerName(taxpayer.getTaxpayerName());

        // Add your other fields here
        // existingReturn.setAmount(surtaxReturn.getAmount());
        // existingReturn.setDueDate(surtaxReturn.getDueDate());

        return taxpayerRepository.save(existingReturn);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void delete(Long id) {

        if (!taxpayerRepository.existsById(id)) {

            throw new RuntimeException(
                    "Surtax return not found with ID: " + id
            );
        }

        taxpayerRepository.deleteById(id);
    }


    // =========================================================
    // FIND BY TAXPAYER
    // =========================================================




    // =========================================================
    // FIND BY STATUS
    // =========================================================








    // =========================================================
    // GET TAXPAYER RETURNS - NEWEST FIRST
    // =========================================================




    // =========================================================
    // GET RETURNS BY STATUS - NEWEST FIRST
    // =========================================================




    // =========================================================
    // COUNT
    // =========================================================

    public long count() {

        return taxpayerRepository.count();
    }

    public Optional<Taxpayer> getByTinNumber(String tin) {
        return taxpayerRepository.findByTin(tin);
    }

    public boolean existsByTinNumber(String tinNumber) {
        return taxpayerRepository.existsByTin(tinNumber);
    }
}
