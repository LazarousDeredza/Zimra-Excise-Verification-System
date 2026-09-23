package com.zimra.excise.dto;

import com.zimra.excise.entity.Currency;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    private BigDecimal amount;

    private Currency currency;

    private String billOfEntry;

    private String receiptNumber;

    private String assessmentNumber;
}