package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminDashboardDto {
    private AdminStats stats;
    private List<TransactionAdminDto> recentTransactions;
    private List<UserAdminDto> recentUsers;
    private List<Map<String, Object>> chartData;
    private Map<String, Object> performanceMetrics;
    private List<Map<String, String>> quickActions;
}