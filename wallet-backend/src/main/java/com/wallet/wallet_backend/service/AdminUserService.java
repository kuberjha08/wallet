package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.*;
import com.wallet.wallet_backend.entity.*;
import com.wallet.wallet_backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final KycDocumentRepository kycDocumentRepository;

    public AdminUserService(
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            KycDocumentRepository kycDocumentRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.kycDocumentRepository = kycDocumentRepository;
    }

    public PagedResponse<UserAdminDto> getUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage;

        if (search != null && !search.isEmpty()) {
            userPage = userRepository.searchUsers(search, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserAdminDto> users = userPage.getContent().stream()
                .map(this::mapToUserAdminDto)
                .collect(Collectors.toList());

        return PagedResponse.<UserAdminDto>builder()
                .content(users)
                .page(page)
                .size(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    public AdminUserDetailDto getUserDetails(Long userId) {
        System.out.println("=== DEBUG: getUserDetails called for userId: " + userId + " ===");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("✅ User found: " + user.getName());

        List<KycDocument> kycDocs = kycDocumentRepository.findByUserId(userId);
        System.out.println("📄 KYC Documents found: " + kycDocs.size());

        Page<Transaction> transactionsPage = transactionRepository.findByUserId(userId, PageRequest.of(0, 5));
        List<Transaction> recentTransactions = transactionsPage.getContent();
        System.out.println("💰 Recent transactions found: " + recentTransactions.size());

        // Calculate stats with null safety - with DEBUG
        System.out.println("📊 Fetching transaction stats...");

        Double totalDeposits = null;
        Double totalWithdrawals = null;
        Long transactionCount = null;

        try {
            totalDeposits = transactionRepository.sumAmountByUserIdAndType(userId, "DEPOSIT");
            System.out.println("   totalDeposits: " + totalDeposits);
        } catch (Exception e) {
            System.out.println("   ❌ Error fetching totalDeposits: " + e.getMessage());
        }

        try {
            totalWithdrawals = transactionRepository.sumAmountByUserIdAndType(userId, "WITHDRAWAL");
            System.out.println("   totalWithdrawals: " + totalWithdrawals);
        } catch (Exception e) {
            System.out.println("   ❌ Error fetching totalWithdrawals: " + e.getMessage());
        }

        try {
            transactionCount = transactionRepository.countByUserId(userId);
            System.out.println("   transactionCount: " + transactionCount);
        } catch (Exception e) {
            System.out.println("   ❌ Error fetching transactionCount: " + e.getMessage());
        }

        // Null safe values
        double safeTotalDeposits = totalDeposits != null ? totalDeposits : 0.0;
        double safeTotalWithdrawals = totalWithdrawals != null ? totalWithdrawals : 0.0;
        long safeTransactionCount = transactionCount != null ? transactionCount : 0L;

        System.out.println("✅ Safe values - Deposits: " + safeTotalDeposits +
                ", Withdrawals: " + safeTotalWithdrawals +
                ", Count: " + safeTransactionCount);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDeposits", safeTotalDeposits);
        stats.put("totalWithdrawals", safeTotalWithdrawals);
        stats.put("transactionCount", safeTransactionCount);

        // Safe average calculation
        double avgTransaction = 0.0;
        if (safeTransactionCount > 0) {
            avgTransaction = (safeTotalDeposits + safeTotalWithdrawals) / safeTransactionCount;
        }
        stats.put("avgTransaction", avgTransaction);

        System.out.println("📊 Stats map: " + stats);
        System.out.println("=== DEBUG END ===\n");

        // Build DTO
        AdminUserDetailDto dto = AdminUserDetailDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .status(user.getWalletFrozen() ? "Inactive" : "Active")
                .riskLevel(user.getRiskLevel())
                .dateOfBirth(user.getDateOfBirth())
                .nationality(user.getNationality())
                .address(user.getAddress())
                .joinDate(user.getCreatedAt())
                .walletBalance(user.getWalletBalance())
                .frozenFunds(user.getWalletFrozen() ? user.getWalletBalance() : 0.0)
                .isFrozen(user.getWalletFrozen())
                .pendingCredits(0.0)
                .kycStatus(user.getKycStatus())
                .kycDocuments(mapKycDocuments(kycDocs))
                .recentActivities(mapToActivities(recentTransactions))
                .stats(stats)
                .build();

        return dto;
    }

    @Transactional
    public UserAdminDto updateUser(Long userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("riskLevel")) {
            user.setRiskLevel((String) updates.get("riskLevel"));
        }
        if (updates.containsKey("kycStatus")) {
            user.setKycStatus((String) updates.get("kycStatus"));
        }

        userRepository.save(user);
        return mapToUserAdminDto(user);
    }

    @Transactional
    public void freezeUserWallet(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletFrozen(true);
        userRepository.save(user);
    }

    @Transactional
    public void unfreezeUserWallet(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletFrozen(false);
        userRepository.save(user);
    }

    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("pendingKyc", kycDocumentRepository.countPendingKyc());
        stats.put("activeWallets", userRepository.countByWalletFrozenFalse());
        stats.put("totalBalance", userRepository.sumWalletBalance());

        return stats;
    }

    private UserAdminDto mapToUserAdminDto(User user) {
        return UserAdminDto.builder()
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
                .build();
    }

    private List<Map<String, Object>> mapKycDocuments(List<KycDocument> documents) {
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", doc.getDocumentType());
                    map.put("status", doc.getStatus());
                    map.put("url", doc.getDocumentUrl());
                    map.put("submittedAt", doc.getSubmittedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapToActivities(List<Transaction> transactions) {
        return transactions.stream()
                .map(tx -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", tx.getId());
                    activity.put("type", tx.getType());
                    activity.put("description", tx.getReference());
                    activity.put("date", formatTimeAgo(tx.getCreatedAt()));
                    activity.put("method", tx.getPaymentMethod());
                    activity.put("amount", tx.getAmount());
                    activity.put("amountType", tx.getType().equals("DEPOSIT") ? "credit" : "debit");
                    activity.put("status", tx.getStatus().toLowerCase());

                    String icon = tx.getType().equals("DEPOSIT") ? "ArrowDownwardIcon"
                            : tx.getType().equals("WITHDRAWAL") ? "TrendingDownIcon" : "ShoppingCartIcon";
                    activity.put("icon", icon);

                    String iconBg = tx.getType().equals("DEPOSIT") ? "success"
                            : tx.getType().equals("WITHDRAWAL") ? "error" : "info";
                    activity.put("iconBg", iconBg);

                    return activity;
                })
                .collect(Collectors.toList());
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 60) {
            return minutes + " mins ago";
        } else if (hours < 24) {
            return hours + " hours ago";
        } else {
            return days + " days ago";
        }
    }
}