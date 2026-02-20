package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminUserDetailDto {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String status;
    private String riskLevel;
    private String dateOfBirth;
    private String nationality;
    private String address;
    private LocalDateTime joinDate;
    private Double walletBalance;
    private Double frozenFunds;
    private Boolean isFrozen;
    private Double pendingCredits;
    private String kycStatus;
    private List<Map<String, Object>> kycDocuments;
    private List<Map<String, Object>> recentActivities;
    private Map<String, Object> stats;
}