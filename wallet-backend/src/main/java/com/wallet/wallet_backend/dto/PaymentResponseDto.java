package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PaymentResponseDto {
    private Boolean success;
    private String transactionId;
    private Long requestId;
    private Double amount;
    private String payerName;
    private String payeeName;
    private String message;
    private LocalDateTime timestamp;
}