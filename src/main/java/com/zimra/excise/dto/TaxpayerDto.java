package com.zimra.excise.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxpayerDto {

    private Long id;
    private String taxpayerName;
    private String address;
    private String tinNumber;
    private String phoneNumber;
    private String idNumber;

    private String email;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<ReturnSummaryDto> returns;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReturnSummaryDto {

        private Long id;

        private Integer returnMonth;
        private Integer returnYear;

        private String manufacturer;
        private String address;

        private java.math.BigDecimal totalPayable;
        private java.math.BigDecimal totalPaid;
        private java.math.BigDecimal variance;

        private String status;

        private LocalDateTime submittedAt;
    }
}