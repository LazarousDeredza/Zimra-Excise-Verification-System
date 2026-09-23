package com.zimra.excise.dto;

import com.zimra.excise.entity.Currency;
import com.zimra.excise.entity.ProductCategory;
import com.zimra.excise.entity.VerificationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurtaxReturnResponse {

    private Long id;

    private TaxpayerInfo taxpayer;

    private Integer returnMonth;

    private Integer returnYear;

    private String manufacturer;

    private String address;

    private List<ProductInfo> products;

    private List<PaymentInfo> payments;

    private BigDecimal totalPaid;

    private BigDecimal variance;




    private BigDecimal totalOpeningStock;

    private BigDecimal totalExternalReceipts;

    private BigDecimal totalProduction;

    private BigDecimal totalLitres;

    private BigDecimal totalDutiableDisposal;

    private BigDecimal totalExports;

    private BigDecimal totalDestruction;

    private BigDecimal totalClosingStock;

    private BigDecimal totalDisposed;

    private BigDecimal totalSugarContent;

    private BigDecimal totalPayable;

   /* private Currency currency;

    private BigDecimal amountPaid;*/

    private VerificationStatus status;

    private LocalDateTime submittedAt;


    // ==========================================
    // TAXPAYER INFORMATION
    // ==========================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaxpayerInfo {

        private Long id;

        private String taxpayerName;

        private String address;
        private String email;

        private String tinNumber;

        private String phoneNumber;

        private String idNumber;
    }

    // ==========================================
    // PAYMENT INFORMATION
    // ==========================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentInfo {

        private Long id;

        private BigDecimal amount;

        private Currency currency;

        private String billOfEntry;

        private String receiptNumber;

        private String assessmentNumber;
    }


    // ==========================================
    // PRODUCT INFORMATION
    // ==========================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductInfo {

        private Long id;

        private String productName;

        private ProductCategory productCategory;

        private BigDecimal openingStockOnHand;

        private BigDecimal externalReceipts;

        private BigDecimal production;

        private BigDecimal totalLitres;

        private BigDecimal dutiableDisposal;

        private BigDecimal exports;

        private BigDecimal destruction;

        private BigDecimal closingStock;

        private BigDecimal totalDisposed;

        private BigDecimal declaredGramsPerLitre;

        private BigDecimal totalSugarContent;

        private BigDecimal surtaxRate;

        private BigDecimal totalPayable;
    }
}







































