package com.wallet.wallet_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "type") // DEPOSIT, WITHDRAWAL, TRANSFER
    private String type;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "balance_after")
    private Double balanceAfter;

    @Column(name = "status") // COMPLETED, PENDING, FAILED
    private String status;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "reference")
    private String reference;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_info")
    private String deviceInfo;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "COMPLETED";
        }
        if (transactionId == null) {
            transactionId = "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
        }
    }
}