package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionAdminDto {
    private Long id;
    private String transactionId;
    private String userName;
    private String userAvatar;
    private String type;
    private Double amount;
    private String status;
    private LocalDateTime date;
    private String paymentMethod;
}