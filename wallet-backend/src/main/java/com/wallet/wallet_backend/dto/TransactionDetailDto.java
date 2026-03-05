package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDetailDto {
    private String transactionId;
    private String type;           // CREDIT, DEBIT, TRANSFER
    private Double amount;
    private String status;          // COMPLETED, PENDING, FAILED
    private String reference;
    private String description;
    private LocalDateTime date;
    
    // Sender/Receiver details
    private CounterpartyDto from;
    private CounterpartyDto to;
    
    // Payment details
    private String paymentMethod;
    private String category;
    private String note;
    private Double balanceAfter;
    
    // Additional info
    private String ipAddress;
    private String deviceInfo;
    private LocalDateTime settledAt;
    
    @Data
    @Builder
    public static class CounterpartyDto {
        private Long id;
        private String name;
        private String mobile;
        private String email;
        private String avatar;
    }
}