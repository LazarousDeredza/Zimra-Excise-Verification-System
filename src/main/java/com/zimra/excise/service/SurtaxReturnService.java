package com.zimra.excise.service;

import com.zimra.excise.dto.PaymentRequest;
import com.zimra.excise.dto.SurtaxReturnRequest;
import com.zimra.excise.dto.SurtaxReturnResponse;
import com.zimra.excise.entity.Payment;
import com.zimra.excise.entity.SurtaxReturn;
import com.zimra.excise.entity.SurtaxReturnProduct;
import com.zimra.excise.entity.Taxpayer;
import com.zimra.excise.repository.PaymentRepository;
import com.zimra.excise.repository.SurtaxReturnRepository;
import com.zimra.excise.repository.TaxpayerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SurtaxReturnService {

    private final SurtaxReturnRepository surtaxReturnRepository;
    private final TaxpayerRepository taxpayerRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    public SurtaxReturnService(SurtaxReturnRepository surtaxReturnRepository, TaxpayerRepository taxpayerRepository, PaymentRepository paymentRepository, EmailService emailService) {
        this.surtaxReturnRepository = surtaxReturnRepository;
        this.taxpayerRepository = taxpayerRepository;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
    }


    @Transactional
    public SurtaxReturnResponse create(SurtaxReturnRequest request) {

        Taxpayer taxpayer =
                taxpayerRepository.findById(
                        request.getTaxpayerId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Taxpayer not found"
                        )
                );



        // ==========================================
        // Creating Surtax Return Model for saving
        // ==========================================




        SurtaxReturn surtaxReturn =
                SurtaxReturn.builder()

                        .taxpayer(taxpayer)

                        .returnMonth(
                                request.getReturnMonth()
                        )

                        .returnYear(
                                request.getReturnYear()
                        )

                        .manufacturer(
                                request.getManufacturer()
                        )

                        .address(
                                request.getAddress()
                        )



                        .build();

        //ADDING PRODUCTS TO THE RETURN

        if (request.getProducts() != null) {

            request.getProducts().forEach(
                    productRequest -> {

                        SurtaxReturnProduct product =
                                SurtaxReturnProduct.builder()

                                        .surtaxReturn(
                                                surtaxReturn
                                        )

                                        .productName(
                                                productRequest
                                                        .getProductName()
                                        )

                                        .productCategory(
                                                productRequest
                                                        .getProductCategory()
                                        )

                                        .openingStockOnHand(
                                                productRequest
                                                        .getOpeningStockOnHand()
                                        )

                                        .externalReceipts(
                                                productRequest
                                                        .getExternalReceipts()
                                        )

                                        .production(
                                                productRequest
                                                        .getProduction()
                                        )

                                        .dutiableDisposal(
                                                productRequest
                                                        .getDutiableDisposal()
                                        )

                                        .exports(
                                                productRequest
                                                        .getExports()
                                        )

                                        .destruction(
                                                productRequest
                                                        .getDestruction()
                                        )

                                        .declaredGramsPerLitre(
                                                productRequest
                                                        .getDeclaredGramsPerLitre()
                                        )

                                        .build();


                        surtaxReturn
                                .getProducts()
                                .add(product);

                    });

        }

//ADDING PAYMENTS TO THE RETURN
        if (request.getPayments() != null) {

            request.getPayments().forEach(
                    paymentRequest -> {

                        Payment payment =
                                Payment.builder()
                                        .surtaxReturn(surtaxReturn)
                                        .amount(paymentRequest.getAmount())
                                        .currency(paymentRequest.getCurrency())
                                        .billOfEntry(paymentRequest.getBillOfEntry())
                                        .receiptNumber(paymentRequest.getReceiptNumber())
                                        .assessmentNumber(
                                                paymentRequest.getAssessmentNumber()
                                        )
                                        .build();

                        surtaxReturn.getPayments().add(payment);
                    }
            );
        }


        // Calculates all product and return totals
        surtaxReturn.calculateTotals();


        SurtaxReturn savedReturn =
                surtaxReturnRepository.save(
                        surtaxReturn
                );

        // Send notification if variance is negative
        if (savedReturn.getVariance() != null &&
                savedReturn.getVariance()
                        .compareTo(BigDecimal.ZERO) < 0) {

            emailService.sendNegativeVarianceEmail(
                    savedReturn.getId(),
                    taxpayer.getTaxpayerName(),
                    taxpayer.getEmail(),
                    taxpayer.getTin(),
                    savedReturn.getReturnMonth(),
                    savedReturn.getReturnYear(),
                    savedReturn.getTotalPayable(),
                    savedReturn.getTotalPaid(),
                    savedReturn.getVariance()
            );
        }



        /*
         * IMPORTANT:
         * Return DTO, NOT the JPA entity.
         */
        return SurtaxReturnResponse.builder()

                .id(savedReturn.getId())

                .taxpayer(
                        SurtaxReturnResponse.TaxpayerInfo.builder()
                                .id(taxpayer.getId())
                                .taxpayerName(taxpayer.getTaxpayerName())
                                .address(taxpayer.getAddress())
                                .tinNumber(taxpayer.getTin())
                                .phoneNumber(taxpayer.getPhoneNumber())
                                .idNumber(taxpayer.getIdNumber())
                                .build()
                )

                .returnMonth(
                        savedReturn.getReturnMonth()
                )

                .returnYear(
                        savedReturn.getReturnYear()
                )

                .manufacturer(
                        savedReturn.getManufacturer()
                )

                .address(
                        savedReturn.getAddress()
                )

                .products(
                        savedReturn.getProducts()
                                .stream()
                                .map(product ->
                                        SurtaxReturnResponse.ProductInfo.builder()
                                                .id(product.getId())
                                                .productName(product.getProductName())
                                                .productCategory(product.getProductCategory())
                                                .openingStockOnHand(product.getOpeningStockOnHand())
                                                .externalReceipts(product.getExternalReceipts())
                                                .production(product.getProduction())
                                                .totalLitres(product.getTotalLitres())
                                                .dutiableDisposal(product.getDutiableDisposal())
                                                .exports(product.getExports())
                                                .destruction(product.getDestruction())
                                                .closingStock(product.getClosingStock())
                                                .totalDisposed(product.getTotalDisposed())
                                                .declaredGramsPerLitre(product.getDeclaredGramsPerLitre())
                                                .totalSugarContent(product.getTotalSugarContent())
                                                .surtaxRate(product.getSurtaxRate())
                                                .totalPayable(product.getTotalPayable())
                                                .build()
                                )
                                .toList()
                )
                .payments(
                        savedReturn.getPayments()
                                .stream()
                                .map(payment ->
                                        SurtaxReturnResponse.PaymentInfo.builder()
                                                .id(payment.getId())
                                                .amount(payment.getAmount())
                                                .currency(payment.getCurrency())
                                                .billOfEntry(payment.getBillOfEntry())
                                                .receiptNumber(payment.getReceiptNumber())
                                                .assessmentNumber(
                                                        payment.getAssessmentNumber()
                                                )
                                                .build()
                                )
                                .toList()
                )

                .totalPaid(
                        savedReturn.getTotalPaid()
                )

                .variance(
                        savedReturn.getVariance()
                )

                .totalOpeningStock(
                        savedReturn.getTotalOpeningStock()
                )

                .totalExternalReceipts(
                        savedReturn.getTotalExternalReceipts()
                )

                .totalProduction(
                        savedReturn.getTotalProduction()
                )

                .totalLitres(
                        savedReturn.getTotalLitres()
                )

                .totalDutiableDisposal(
                        savedReturn.getTotalDutiableDisposal()
                )

                .totalExports(
                        savedReturn.getTotalExports()
                )

                .totalDestruction(
                        savedReturn.getTotalDestruction()
                )

                .totalClosingStock(
                        savedReturn.getTotalClosingStock()
                )

                .totalDisposed(
                        savedReturn.getTotalDisposed()
                )

                .totalSugarContent(
                        savedReturn.getTotalSugarContent()
                )

                .totalPayable(
                        savedReturn.getTotalPayable()
                )



                .status(
                        savedReturn.getStatus()
                )

                .submittedAt(
                        savedReturn.getSubmittedAt()
                )

                .build();
    }


    // =========================================================
// FIND ONE
// =========================================================

    @Transactional()
    public SurtaxReturnResponse getById(Long id) {

        SurtaxReturn surtaxReturn =
                surtaxReturnRepository.findReturnById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Surtax return not found with ID: " + id
                                ));

        // Get payments belonging to this return
        List<Payment> payments =
                paymentRepository.findBySurtaxReturnId(id);

        // Convert entity to response DTO
        return convertToResponse(
                surtaxReturn,
                payments
        );
    }

    // =========================================================
    // FIND ALL
    // =========================================================


    @Transactional()
    public List<SurtaxReturnResponse> getAll() {

        List<SurtaxReturn> returns =
                surtaxReturnRepository
                        .findAllReturns();

        if (returns.isEmpty()) {
            return List.of();
        }

        List<Long> returnIds =
                returns.stream()
                        .map(SurtaxReturn::getId)
                        .toList();

        List<Payment> payments =
                paymentRepository.findBySurtaxReturnIds(
                        returnIds
                );

        Map<Long, List<Payment>> paymentsByReturn =
                payments.stream()
                        .collect(
                                Collectors.groupingBy(
                                        payment ->
                                                payment.getSurtaxReturn().getId()
                                )
                        );

        return returns.stream()
                .map(surtaxReturn ->
                        convertToResponse(
                                surtaxReturn,
                                paymentsByReturn.getOrDefault(
                                        surtaxReturn.getId(),
                                        List.of()
                                )
                        )
                )
                .toList();
    }


    // =========================================================
    // ADD PAYMENT TO RETURN
    // =========================================================
    @Transactional
    public SurtaxReturnResponse addPayment(
            Long returnId,
            PaymentRequest request) {

        SurtaxReturn surtaxReturn =
                surtaxReturnRepository.findById(returnId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Surtax return not found with ID: "
                                                + returnId
                                ));


        Payment payment = Payment.builder()

                .surtaxReturn(surtaxReturn)

                .amount(request.getAmount())

                .currency(request.getCurrency())

                .billOfEntry(
                        request.getBillOfEntry()
                )

                .receiptNumber(
                        request.getReceiptNumber()
                )

                .assessmentNumber(
                        request.getAssessmentNumber()
                )

                .build();


        /* Add payment to the return */

        surtaxReturn.getPayments()
                .add(payment);


        /*
         * Recalculate total paid and variance
         */

        surtaxReturn.calculatePaymentTotals();


        /*
         * Save the return.
         *
         * CascadeType.ALL on payments will
         * persist the new payment.
         */

        SurtaxReturn savedReturn =
                surtaxReturnRepository.save(
                        surtaxReturn
                );


        return convertToResponse(
                savedReturn,
                savedReturn.getPayments()
        );
    }





    private SurtaxReturnResponse convertToResponse(
            SurtaxReturn surtaxReturn,
            List<Payment> payments) {

        Taxpayer taxpayer = surtaxReturn.getTaxpayer();

        return SurtaxReturnResponse.builder()

                // ==========================================
                // RETURN INFORMATION
                // ==========================================

                .id(surtaxReturn.getId())

                .returnMonth(
                        surtaxReturn.getReturnMonth()
                )

                .returnYear(
                        surtaxReturn.getReturnYear()
                )

                .manufacturer(
                        surtaxReturn.getManufacturer()
                )

                .address(
                        surtaxReturn.getAddress()
                )


                // ==========================================
                // TAXPAYER
                // ==========================================

                .taxpayer(
                        SurtaxReturnResponse.TaxpayerInfo.builder()

                                .id(taxpayer.getId())

                                .taxpayerName(
                                        taxpayer.getTaxpayerName()
                                )

                                .address(
                                        taxpayer.getAddress()
                                )

                                .tinNumber(
                                        taxpayer.getTin()
                                )

                                .phoneNumber(
                                        taxpayer.getPhoneNumber()
                                )

                                .idNumber(
                                        taxpayer.getIdNumber()
                                )

                                .build()
                )


                // ==========================================
                // PRODUCTS
                // ==========================================

                .products(
                        surtaxReturn.getProducts()
                                .stream()
                                .map(product ->
                                        SurtaxReturnResponse.ProductInfo.builder()

                                                .id(product.getId())

                                                .productName(
                                                        product.getProductName()
                                                )

                                                .productCategory(
                                                        product.getProductCategory()
                                                )

                                                .openingStockOnHand(
                                                        product.getOpeningStockOnHand()
                                                )

                                                .externalReceipts(
                                                        product.getExternalReceipts()
                                                )

                                                .production(
                                                        product.getProduction()
                                                )

                                                .totalLitres(
                                                        product.getTotalLitres()
                                                )

                                                .dutiableDisposal(
                                                        product.getDutiableDisposal()
                                                )

                                                .exports(
                                                        product.getExports()
                                                )

                                                .destruction(
                                                        product.getDestruction()
                                                )

                                                .closingStock(
                                                        product.getClosingStock()
                                                )

                                                .totalDisposed(
                                                        product.getTotalDisposed()
                                                )

                                                .declaredGramsPerLitre(
                                                        product.getDeclaredGramsPerLitre()
                                                )

                                                .totalSugarContent(
                                                        product.getTotalSugarContent()
                                                )

                                                .surtaxRate(
                                                        product.getSurtaxRate()
                                                )

                                                .totalPayable(
                                                        product.getTotalPayable()
                                                )

                                                .build()
                                )
                                .toList()
                )


                // ==========================================
                // RETURN TOTALS
                // ==========================================

                .totalOpeningStock(
                        surtaxReturn.getTotalOpeningStock()
                )

                .totalExternalReceipts(
                        surtaxReturn.getTotalExternalReceipts()
                )

                .totalProduction(
                        surtaxReturn.getTotalProduction()
                )

                .totalLitres(
                        surtaxReturn.getTotalLitres()
                )

                .totalDutiableDisposal(
                        surtaxReturn.getTotalDutiableDisposal()
                )

                .totalExports(
                        surtaxReturn.getTotalExports()
                )

                .totalDestruction(
                        surtaxReturn.getTotalDestruction()
                )

                .totalClosingStock(
                        surtaxReturn.getTotalClosingStock()
                )

                .totalDisposed(
                        surtaxReturn.getTotalDisposed()
                )

                .totalSugarContent(
                        surtaxReturn.getTotalSugarContent()
                )

                .totalPayable(
                        surtaxReturn.getTotalPayable()
                )


                // ==========================================
                // PAYMENTS
                // ==========================================

                .payments(
                        payments.stream()
                                .map(payment ->
                                        SurtaxReturnResponse.PaymentInfo.builder()

                                                .id(payment.getId())

                                                .amount(
                                                        payment.getAmount()
                                                )

                                                .currency(
                                                        payment.getCurrency()
                                                )

                                                .billOfEntry(
                                                        payment.getBillOfEntry()
                                                )

                                                .receiptNumber(
                                                        payment.getReceiptNumber()
                                                )

                                                .assessmentNumber(
                                                        payment.getAssessmentNumber()
                                                )

                                                .build()
                                )
                                .toList()
                )

                .totalPaid(
                        surtaxReturn.getTotalPaid()
                )

                .variance(
                        surtaxReturn.getVariance()
                )


                // ==========================================
                // STATUS
                // ==========================================

                .status(
                        surtaxReturn.getStatus()
                )

                .submittedAt(
                        surtaxReturn.getSubmittedAt()
                )

                .build();
    }







    private SurtaxReturnResponse mapToResponse(
            SurtaxReturn surtaxReturn) {

        Taxpayer taxpayer =
                surtaxReturn.getTaxpayer();


        List<SurtaxReturnResponse.ProductInfo> products =
                surtaxReturn.getProducts()
                        .stream()
                        .map(product ->
                                SurtaxReturnResponse.ProductInfo.builder()

                                        .id(product.getId())

                                        .productName(
                                                product.getProductName()
                                        )

                                        .productCategory(
                                                product.getProductCategory()
                                        )

                                        .openingStockOnHand(
                                                product.getOpeningStockOnHand()
                                        )

                                        .externalReceipts(
                                                product.getExternalReceipts()
                                        )

                                        .production(
                                                product.getProduction()
                                        )

                                        .totalLitres(
                                                product.getTotalLitres()
                                        )

                                        .dutiableDisposal(
                                                product.getDutiableDisposal()
                                        )

                                        .exports(
                                                product.getExports()
                                        )

                                        .destruction(
                                                product.getDestruction()
                                        )

                                        .closingStock(
                                                product.getClosingStock()
                                        )

                                        .totalDisposed(
                                                product.getTotalDisposed()
                                        )

                                        .declaredGramsPerLitre(
                                                product.getDeclaredGramsPerLitre()
                                        )

                                        .totalSugarContent(
                                                product.getTotalSugarContent()
                                        )

                                        .surtaxRate(
                                                product.getSurtaxRate()
                                        )

                                        .totalPayable(
                                                product.getTotalPayable()
                                        )

                                        .build()
                        )
                        .toList();




        List<SurtaxReturnResponse.PaymentInfo> payments =
                surtaxReturn.getPayments()
                        .stream()
                        .map(payment ->
                                SurtaxReturnResponse.PaymentInfo.builder()

                                        .id(payment.getId())

                                        .amount(
                                                payment.getAmount()
                                        )

                                        .billOfEntry(
                                                payment.getBillOfEntry()
                                        )

                                        .assessmentNumber(
                                                payment.getAssessmentNumber()
                                        )

                                        .receiptNumber(
                                                payment.getReceiptNumber()
                                        )

                                        .currency(
                                                payment.getCurrency()
                                        )



                                        .build()
                        )
                        .toList();


        return SurtaxReturnResponse.builder()

                .id(
                        surtaxReturn.getId()
                )

                // ==========================================
                // TAXPAYER
                // ==========================================

                .taxpayer(
                        SurtaxReturnResponse.TaxpayerInfo.builder()

                                .id(
                                        taxpayer.getId()
                                )

                                .taxpayerName(
                                        taxpayer.getTaxpayerName()
                                )

                                .address(
                                        taxpayer.getAddress()
                                )

                                .tinNumber(
                                        taxpayer.getTin()
                                )

                                .phoneNumber(
                                        taxpayer.getPhoneNumber()
                                )

                                .idNumber(
                                        taxpayer.getIdNumber()
                                )

                                .build()
                )


                // ==========================================
                // RETURN INFORMATION
                // ==========================================

                .returnMonth(
                        surtaxReturn.getReturnMonth()
                )

                .returnYear(
                        surtaxReturn.getReturnYear()
                )

                .manufacturer(
                        surtaxReturn.getManufacturer()
                )

                .address(
                        surtaxReturn.getAddress()
                )

                // ==========================================
                // PRODUCTS
                // ==========================================

                .products(products)

                // ==========================================
                // PAYMENTS
                // ==========================================

                .payments(payments)

                .totalPaid(
                        surtaxReturn.getTotalPaid()
                )

                .variance(
                        surtaxReturn.getVariance()
                )

                // ==========================================
                // RETURN TOTALS
                // ==========================================

                .totalOpeningStock(
                        surtaxReturn.getTotalOpeningStock()
                )

                .totalExternalReceipts(
                        surtaxReturn.getTotalExternalReceipts()
                )

                .totalProduction(
                        surtaxReturn.getTotalProduction()
                )

                .totalLitres(
                        surtaxReturn.getTotalLitres()
                )

                .totalDutiableDisposal(
                        surtaxReturn.getTotalDutiableDisposal()
                )

                .totalExports(
                        surtaxReturn.getTotalExports()
                )

                .totalDestruction(
                        surtaxReturn.getTotalDestruction()
                )

                .totalClosingStock(
                        surtaxReturn.getTotalClosingStock()
                )

                .totalDisposed(
                        surtaxReturn.getTotalDisposed()
                )

                .totalSugarContent(
                        surtaxReturn.getTotalSugarContent()
                )

                .totalPayable(
                        surtaxReturn.getTotalPayable()
                )

                // ==========================================
                // STATUS
                // ==========================================

                .status(
                        surtaxReturn.getStatus()
                )

                .submittedAt(
                        surtaxReturn.getSubmittedAt()
                )

                .build();
    }

    // =========================================================
    //ADD / CREATE
    // =========================================================

    public SurtaxReturn create(SurtaxReturn surtaxReturn) {

        return surtaxReturnRepository.save(surtaxReturn);
    }


   /*  =========================================================
     UPDATE
     =========================================================*/

    public SurtaxReturn update(Long id, SurtaxReturn surtaxReturn) {

        SurtaxReturn existingReturn = surtaxReturnRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Surtax return not found with ID: " + id
                        )
                );

        // Set the fields you want to update
        //existingReturn.setReturnPeriod(surtaxReturn.getReturnPeriod());
        existingReturn.setStatus(surtaxReturn.getStatus());

        // Add your other fields here
        // existingReturn.setAmount(surtaxReturn.getAmount());
        // existingReturn.setDueDate(surtaxReturn.getDueDate());

        return surtaxReturnRepository.save(existingReturn);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void delete(Long id) {

        if (!surtaxReturnRepository.existsById(id)) {

            throw new RuntimeException(
                    "Surtax return not found with ID: " + id
            );
        }

        surtaxReturnRepository.deleteById(id);
    }


    // =========================================================
    // FIND BY TAXPAYER
    // =========================================================

    public List<SurtaxReturn> getByTaxpayerId(Long taxpayerId) {

        return surtaxReturnRepository.findByTaxpayerId(taxpayerId);
    }


    // =========================================================
    // FIND BY STATUS
    // =========================================================

    public List<SurtaxReturn> getByStatus(String status) {

        return surtaxReturnRepository.findByStatus(status);
    }


    // =========================================================
    // FIND BY RETURN PERIOD
    // =========================================================

    public List<SurtaxReturn> getByReturnPeriod(String month,String year) {

        return surtaxReturnRepository.findByReturnMonthAndReturnYear(month ,year);
    }


    // =========================================================
    // FIND TAXPAYER RETURN FOR PERIOD
    // =========================================================


    // =========================================================
    // CHECK IF RETURN EXISTS
    // =========================================================

    public boolean existsByTaxpayerAndPeriod(
            Long taxpayerId,
            String returnMonth,String returnYear
    ) {

        return surtaxReturnRepository
                .existsByTaxpayerIdAndReturnMonthAndReturnYear(
                        taxpayerId,returnMonth, returnYear
                );
    }


    // =========================================================
    // GET TAXPAYER RETURNS - NEWEST FIRST
    // =========================================================

    public List<SurtaxReturn> getTaxpayerReturns(Long taxpayerId) {

        return surtaxReturnRepository
                .findByTaxpayerIdOrderByIdDesc(taxpayerId);
    }


    // =========================================================
    // GET RETURNS BY STATUS - NEWEST FIRST
    // =========================================================

    public List<SurtaxReturn> getReturnsByStatus(String status) {

        return surtaxReturnRepository
                .findByStatusOrderByIdDesc(status);
    }


    // =========================================================
    // COUNT
    // =========================================================

    public long count() {

        return surtaxReturnRepository.count();
    }

    public List<SurtaxReturn> getAllByTinNumber(Long tinNumber) {

        return surtaxReturnRepository.findByTaxpayerTin(tinNumber);
    }
}