package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.entity.WalletTransaction;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.repository.WalletTransactionRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.QRCodeService;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    
    private final UserRepository userRepository;
    private final WalletTransactionRepository transactionRepository;
    private final QRCodeService qrCodeService;
    
    public DashboardController(UserRepository userRepository, 
                              WalletTransactionRepository transactionRepository,
                              QRCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.qrCodeService = qrCodeService;
    }
    
    @GetMapping
    public Map<String, Object> getDashboard(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate QR code if not exists
        if (user.getQrCodeData() == null) {
            String qrCode = qrCodeService.generateStaticQR(
                    user.getId(), user.getMobile(), user.getName(), user.getUpiId());
            user.setQrCodeData(qrCode);
            userRepository.save(user);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", mapToMap(user));
        response.put("stats", getRealStats(userId));
        response.put("quickActions", getQuickActions());
        response.put("recentTransactions", getRealRecentTransactions(userId));
        
        return response;
    }
    
    // 👇 REAL STATS FROM DATABASE
    private Map<String, Object> getRealStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all transactions for this user
        List<WalletTransaction> allTxns = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Calculate total received (CREDIT)
        double totalReceived = allTxns.stream()
                .filter(t -> "CREDIT".equals(t.getType()))
                .mapToDouble(WalletTransaction::getAmount)
                .sum();
        
        // Calculate total sent (DEBIT)
        double totalSent = allTxns.stream()
                .filter(t -> "DEBIT".equals(t.getType()))
                .mapToDouble(WalletTransaction::getAmount)
                .sum();
        
        // Total transactions count
        int totalTransactions = allTxns.size();
        
        // This month's transactions
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        long thisMonthTransactions = allTxns.stream()
                .filter(t -> t.getCreatedAt().isAfter(startOfMonth))
                .count();
        
        stats.put("totalTransactions", totalTransactions);
        stats.put("totalReceived", totalReceived);
        stats.put("totalSent", totalSent);
        stats.put("thisMonthTransactions", (int) thisMonthTransactions);
        
        return stats;
    }
    
    // 👇 REAL RECENT TRANSACTIONS FROM DATABASE
    private List<Map<String, Object>> getRealRecentTransactions(Long userId) {
        List<WalletTransaction> recentTxns = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(5)  // Last 5 transactions
                .collect(Collectors.toList());
        
        List<Map<String, Object>> transactions = new ArrayList<>();
        
        for (WalletTransaction txn : recentTxns) {
            Map<String, Object> txnMap = new HashMap<>();
            txnMap.put("id", txn.getId());
            txnMap.put("type", txn.getType());
            txnMap.put("amount", txn.getAmount());
            txnMap.put("time", formatTimeAgo(txn.getCreatedAt()));
            
            // Set from/to based on transaction type
            if ("CREDIT".equals(txn.getType())) {
                txnMap.put("from", txn.getReference() != null ? txn.getReference() : "Bank Transfer");
            } else {
                txnMap.put("to", txn.getReference() != null ? txn.getReference() : "Bank Withdrawal");
            }
            
            transactions.add(txnMap);
        }
        
        return transactions;
    }
    
    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);
        
        if (minutes < 60) {
            return minutes + " minutes ago";
        } else if (hours < 24) {
            return hours + " hours ago";
        } else {
            return days + " days ago";
        }
    }
    
    private Map<String, String> getQuickActions() {
        Map<String, String> actions = new HashMap<>();
        actions.put("pay", "Pay to Contact");
        actions.put("request", "Request Money");
        actions.put("scan", "Scan QR");
        actions.put("addMoney", "Add Money");
        actions.put("passbook", "View Passbook");
        actions.put("offers", "Offers");
        return actions;
    }
    
    private Map<String, Object> mapToMap(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("mobile", user.getMobile());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("walletBalance", user.getWalletBalance());
        userMap.put("walletFrozen", user.getWalletFrozen());
        userMap.put("kycStatus", user.getKycStatus());
        userMap.put("createdAt", user.getCreatedAt());
        userMap.put("upiId", user.getUpiId());
        userMap.put("qrCodeData", user.getQrCodeData());
        return userMap;
    }
    
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtil.validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}