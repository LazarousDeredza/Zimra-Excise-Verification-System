package com.zimra.excise.dto;

import com.zimra.excise.entity.Currency;
import com.zimra.excise.entity.ProductCategory;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurtaxReturnRequest {

    private Long taxpayerId;

    private Integer returnMonth;

    private Integer returnYear;

    private String manufacturer;

    private String address;

    private List<ProductRequest> products;
    private List<PaymentRequest> payments;

//    private Currency currency;
//
//    private BigDecimal amountPaid;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRequest {

        private String productName;

        private ProductCategory productCategory;

        private BigDecimal openingStockOnHand;

        private BigDecimal externalReceipts;

        private BigDecimal production;

        private BigDecimal dutiableDisposal;

        private BigDecimal exports;

        private BigDecimal destruction;

        private BigDecimal declaredGramsPerLitre;
    }

    // ==========================================
    // PAYMENT
    // ==========================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentRequest {

        private BigDecimal amount;

        private Currency currency;

        private String billOfEntry;

        private String receiptNumber;

        private String assessmentNumber;
    }
}