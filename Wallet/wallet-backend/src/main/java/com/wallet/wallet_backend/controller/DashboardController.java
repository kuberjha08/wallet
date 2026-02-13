package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.QRCodeService;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;
    
    public DashboardController(UserRepository userRepository, QRCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.qrCodeService = qrCodeService;
    }
    
    @GetMapping
    public Map<String, Object> getDashboard(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate QR code if not exists (first time dashboard access)
        if (user.getQrCodeData() == null) {
            String qrCode = qrCodeService.generateStaticQR(
                    user.getId(), user.getMobile(), user.getName(), user.getUpiId());
            user.setQrCodeData(qrCode);
            userRepository.save(user);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", mapToMap(user));
        response.put("stats", getStats(userId));
        response.put("quickActions", getQuickActions());
        response.put("recentTransactions", getRecentTransactions(userId));
        
        return response;
    }
    
    @PostMapping("/generate-qr")
    public Map<String, String> generateQR(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String qrCode = qrCodeService.generateStaticQR(
                user.getId(), user.getMobile(), user.getName(), user.getUpiId());
        user.setQrCodeData(qrCode);
        userRepository.save(user);
        
        return Map.of(
            "qrCode", qrCode,
            "message", "QR code regenerated"
        );
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
    
    private Map<String, Object> getStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTransactions", 42);
        stats.put("totalReceived", 15000.0);
        stats.put("totalSent", 8000.0);
        stats.put("thisMonthTransactions", 12);
        return stats;
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
    
    private Object getRecentTransactions(Long userId) {
        return new Object[] {
            Map.of("id", 1, "type", "CREDIT", "amount", 500.0, "from", "John", "time", "2 hours ago"),
            Map.of("id", 2, "type", "DEBIT", "amount", 200.0, "to", "Merchant", "time", "1 day ago"),
            Map.of("id", 3, "type", "CREDIT", "amount", 1000.0, "from", "Salary", "time", "3 days ago")
        };
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