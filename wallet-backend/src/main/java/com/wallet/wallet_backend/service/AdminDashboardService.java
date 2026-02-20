package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.*;
import com.wallet.wallet_backend.entity.*;
import com.wallet.wallet_backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {
    
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    
    public AdminDashboardService(
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            KycDocumentRepository kycDocumentRepository,
            WalletTransactionRepository walletTransactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.kycDocumentRepository = kycDocumentRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }
    
    public AdminDashboardDto getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime lastMonthStart = startOfMonth.minusMonths(1);
        
        // Current stats
        Long totalUsers = userRepository.count();
        Long pendingKyc = kycDocumentRepository.countPendingKyc();
        Long activeWallets = userRepository.countByWalletFrozenFalse();
        Double totalBalance = userRepository.sumWalletBalance();
        
        // Previous period stats
        Long lastMonthUsers = userRepository.countByCreatedAtBefore(startOfMonth);
        Long lastMonthKyc = kycDocumentRepository.countBySubmittedAtBefore(startOfMonth);
        Double lastMonthBalance = userRepository.sumWalletBalanceByCreatedAtBefore(startOfMonth);
        
        // Transaction stats
        Double todayVolume = transactionRepository.sumAmountByDateRange(now.truncatedTo(ChronoUnit.DAYS), now);
        Double yesterdayVolume = transactionRepository.sumAmountByDateRange(
                now.minusDays(1).truncatedTo(ChronoUnit.DAYS),
                now.truncatedTo(ChronoUnit.DAYS));
        
        Long totalTransactions = transactionRepository.count();
        
        // Calculate growth percentages
        String userGrowth = calculateGrowth(totalUsers.doubleValue(), lastMonthUsers.doubleValue());
        String kycGrowth = calculateGrowth(pendingKyc.doubleValue(), lastMonthKyc.doubleValue());
        String balanceChange = calculateGrowth(totalBalance != null ? totalBalance : 0.0, 
                                              lastMonthBalance != null ? lastMonthBalance : 0.0);
        String volumeChange = calculateGrowth(todayVolume != null ? todayVolume : 0.0, 
                                             yesterdayVolume != null ? yesterdayVolume : 0.0);
        
        // Chart data
        List<Long> userGrowthData = getUserGrowthData(6);
        List<Double> transactionVolumeData = getTransactionVolumeData(30);
        Map<String, Double> revenueDistribution = getRevenueDistribution();
        List<Double> performanceMetrics = getPerformanceMetrics();
        
        AdminStats stats = AdminStats.builder()
                .totalUsers(totalUsers)
                .pendingKyc(pendingKyc)
                .activeWallets(activeWallets)
                .totalBalance(totalBalance != null ? totalBalance : 0.0)
                .totalVolume(todayVolume != null ? todayVolume : 0.0)
                .totalTransactions(totalTransactions)
                .userGrowth(userGrowth)
                .kycGrowth(kycGrowth)
                .balanceChange(balanceChange)
                .volumeChange(volumeChange)
                .userGrowthData(userGrowthData)
                .transactionVolumeData(transactionVolumeData)
                .revenueDistribution(revenueDistribution)
                .performanceMetrics(performanceMetrics)
                .build();
        
        // Get recent data
        List<TransactionAdminDto> recentTransactions = getRecentTransactions(5);
        List<UserAdminDto> recentUsers = getRecentUsers(5);
        
        // Chart data
        List<Map<String, Object>> chartData = getChartData();
        
        // Performance metrics
        Map<String, Object> performanceMetricsMap = getPerformanceMetricsMap();
        
        // Quick actions
        List<Map<String, String>> quickActions = getQuickActions();
        
        return AdminDashboardDto.builder()
                .stats(stats)
                .recentTransactions(recentTransactions)
                .recentUsers(recentUsers)
                .chartData(chartData)
                .performanceMetrics(performanceMetricsMap)
                .quickActions(quickActions)
                .build();
    }
    
    private String calculateGrowth(Double current, Double previous) {
        if (previous == null || previous == 0) return "+0%";
        double growth = ((current - previous) / previous) * 100;
        String sign = growth >= 0 ? "+" : "";
        return String.format("%s%.1f%%", sign, growth);
    }
    
    private List<Long> getUserGrowthData(int months) {
        List<Long> data = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
            LocalDateTime end = start.plusMonths(1);
            Long count = userRepository.countByCreatedAtBetween(start, end);
            data.add(count != null ? count : 0L);
        }
        return data;
    }
    
    private List<Double> getTransactionVolumeData(int days) {
        List<Double> data = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).truncatedTo(ChronoUnit.DAYS);
            LocalDateTime end = start.plusDays(1);
            Double volume = transactionRepository.sumAmountByDateRange(start, end);
            data.add(volume != null ? volume : 0.0);
        }
        return data;
    }
    
    private Map<String, Double> getRevenueDistribution() {
        Map<String, Double> distribution = new HashMap<>();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        List<Map<String, Object>> summary = transactionRepository.getTransactionSummary(thirtyDaysAgo);
        for (Map<String, Object> item : summary) {
            String type = (String) item.get("type");
            Double total = (Double) item.get("total");
            distribution.put(type, total != null ? total : 0.0);
        }
        
        return distribution;
    }
    
    private List<Double> getPerformanceMetrics() {
        return Arrays.asList(98.5, 76.2, 84.7, 92.0);
    }
    
    private List<TransactionAdminDto> getRecentTransactions(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Transaction> transactions = transactionRepository.findAll(pageable);
        
        return transactions.getContent().stream()
                .map(tx -> TransactionAdminDto.builder()
                        .id(tx.getId())
                        .transactionId(tx.getTransactionId())
                        .userName(tx.getUserName())
                        .userAvatar("https://via.placeholder.com/32")
                        .type(tx.getType())
                        .amount(tx.getAmount())
                        .status(tx.getStatus())
                        .date(tx.getCreatedAt())
                        .paymentMethod(tx.getPaymentMethod())
                        .build())
                .collect(Collectors.toList());
    }
    
    private List<UserAdminDto> getRecentUsers(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<User> users = userRepository.findAll(pageable);
        
        return users.getContent().stream()
                .map(user -> UserAdminDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .status(user.getWalletFrozen() ? "Inactive" : "Active")
                        .kycStatus(user.getKycStatus())
                        .walletBalance(user.getWalletBalance())
                        .walletType("Primary Wallet")
                        .profilePicture(user.getProfilePicture())
                        .riskLevel(user.getRiskLevel())
                        .createdAt(user.getCreatedAt())
                        .lastActive(user.getLastActive())
                        .walletFrozen(user.getWalletFrozen())
                        .build())
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getChartData() {
        List<Map<String, Object>> charts = new ArrayList<>();
        
        // Transaction trends chart
        Map<String, Object> transactionChart = new HashMap<>();
        transactionChart.put("labels", Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun"));
        transactionChart.put("data", Arrays.asList(45000, 52000, 48000, 58000, 62000, 68000));
        charts.add(transactionChart);
        
        // User growth chart
        Map<String, Object> userChart = new HashMap<>();
        userChart.put("labels", Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun"));
        userChart.put("data", Arrays.asList(120, 150, 180, 220, 280, 350));
        charts.add(userChart);
        
        return charts;
    }
    
    private Map<String, Object> getPerformanceMetricsMap() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("transactionSuccessRate", 98.5);
        metrics.put("kycCompletionRate", 76.2);
        metrics.put("userRetention", 84.7);
        metrics.put("avgResponseTime", 1.2);
        return metrics;
    }
    
    private List<Map<String, String>> getQuickActions() {
        List<Map<String, String>> actions = new ArrayList<>();
        
        Map<String, String> action1 = new HashMap<>();
        action1.put("label", "Manage Users");
        action1.put("icon", "PeopleIcon");
        action1.put("page", "userManagement");
        actions.add(action1);
        
        Map<String, String> action2 = new HashMap<>();
        action2.put("label", "Pending KYC");
        action2.put("icon", "VerifiedUserIcon");
        action2.put("page", "kyc");
        actions.add(action2);
        
        Map<String, String> action3 = new HashMap<>();
        action3.put("label", "Transactions");
        action3.put("icon", "ReceiptIcon");
        action3.put("page", "transactions");
        actions.add(action3);
        
        Map<String, String> action4 = new HashMap<>();
        action4.put("label", "Wallet");
        action4.put("icon", "AccountBalanceWalletIcon");
        action4.put("page", "walletManagement");
        actions.add(action4);
        
        return actions;
    }
}