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
@ToString
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "balance_after")
    private Double balanceAfter;

    @Column(nullable = false)
    private String type;

    private String reference;

    @Column(name = "status")
    private String status = "COMPLETED";  // ✅ DEFAULT VALUE SET KARO

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WalletTransaction(Long userId, Double amount, String type, String reference) {
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.reference = reference;
        this.status = "COMPLETED";  // ✅ YAHAN BHI SET KARO
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {  // ✅ NULL CHECK
            status = "COMPLETED";
        }
    }
}