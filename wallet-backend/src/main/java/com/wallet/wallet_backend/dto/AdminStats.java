package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStats {
    // Overview stats
    private Long totalUsers;
    private Long pendingKyc;
    private Long activeWallets;
    private Double totalBalance;
    private Double totalVolume;
    private Long totalTransactions;
    
    // Trends
    private String userGrowth;
    private String kycGrowth;
    private String balanceChange;
    private String volumeChange;
    
    // Chart data
    private List<Long> userGrowthData;
    private List<Double> transactionVolumeData;
    private Map<String, Double> revenueDistribution;
    private List<Double> performanceMetrics;
}