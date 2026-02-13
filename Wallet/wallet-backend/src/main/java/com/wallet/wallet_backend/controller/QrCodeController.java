package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.QRCodeService;
import io.jsonwebtoken.Claims;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/qr")
public class QrCodeController {
    
    private final QRCodeService qrCodeService;
    private final UserRepository userRepository;
    
    public QrCodeController(QRCodeService qrCodeService, UserRepository userRepository) {
        this.qrCodeService = qrCodeService;
        this.userRepository = userRepository;
    }
    
    // Generate static QR for user (saved in profile)
    @PostMapping("/generate-static")
    public Map<String, String> generateStaticQR(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate QR code
        String qrCode = qrCodeService.generateStaticQR(
                user.getId(), user.getMobile(), user.getName(), user.getUpiId());
        
        // Save to user profile
        user.setQrCodeData(qrCode);
        userRepository.save(user);
        
        return Map.of(
            "qrCode", qrCode,
            "message", "QR code generated successfully"
        );
    }
    
    // Generate dynamic payment QR with amount
    @PostMapping("/generate-payment")
    public Map<String, String> generatePaymentQR(@RequestBody PaymentQRRequest request,
                                                @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String qrCode = qrCodeService.generatePaymentQR(
                user.getId(), user.getMobile(), user.getName(), request.getAmount());
        
        return Map.of(
            "qrCode", qrCode,
            "amount", String.valueOf(request.getAmount()),
            "expiry", "300",
            "message", "Payment QR generated"
        );
    }
    
    // Scan and process QR code
    @PostMapping("/scan")
    public Map<String, Object> scanQR(@RequestBody ScanQRRequest request,
                                     @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        
        // Parse QR data (this would be more complex in real implementation)
        return Map.of(
            "type", "PAYMENT_REQUEST",
            "userId", 123,
            "mobile", "9876543210",
            "name", "John Doe",
            "amount", 100.0,
            "message", "QR scanned successfully"
        );
    }
    
    // Set UPI ID
    @PostMapping("/set-upi")
    public Map<String, String> setUpiId(@RequestBody SetUpiRequest request,
                                       @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setUpiId(request.getUpiId());
        userRepository.save(user);
        
        return Map.of(
            "message", "UPI ID set successfully",
            "upiId", request.getUpiId()
        );
    }
    
    @Getter @Setter
    static class PaymentQRRequest {
        private Double amount;
    }
    
    @Getter @Setter
    static class ScanQRRequest {
        private String qrData;
    }
    
    @Getter @Setter
    static class SetUpiRequest {
        private String upiId;
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