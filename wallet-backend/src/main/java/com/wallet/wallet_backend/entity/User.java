package com.wallet.wallet_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 15)
    private String mobile;

    @Column(nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "mpin_hash")
    private String mpinHash;

    @Column(name = "wallet_balance")
    private Double walletBalance = 0.0;

    @Column(name = "is_wallet_frozen")
    private Boolean walletFrozen = false;

    @Column(name = "kyc_status")
    private String kycStatus = "PENDING";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "role")
    private String role = "USER";

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "step")
    private String step = "SIGNUP";

    @Column(name = "temp_token")
    private String tempToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    @Column(name = "permanent_token")
    private String permanentToken;

    @Column(name = "permanent_token_expiry")
    private LocalDateTime permanentTokenExpiry;

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "qr_code_data", length = 5000)
    private String qrCodeData;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "risk_level")
    private String riskLevel = "LOW";

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "address")
    private String address;

    @Column(name = "profile_picture")
    private String profilePicture;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (walletBalance == null) {
            walletBalance = 0.0;
        }
        if (walletFrozen == null) {
            walletFrozen = false;
        }
        if (kycStatus == null) {
            kycStatus = "PENDING";
        }
        if (role == null) {
            role = "USER";
        }
        if (step == null) {
            step = "SIGNUP";
        }
        if (riskLevel == null) {
            riskLevel = "LOW";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastActive = LocalDateTime.now();
    }
}