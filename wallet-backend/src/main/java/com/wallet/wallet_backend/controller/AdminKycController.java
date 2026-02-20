package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.KycAdminDto;
import com.wallet.wallet_backend.dto.PagedResponse;
import com.wallet.wallet_backend.service.AdminKycService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin/kyc")
public class AdminKycController {
    
    private final AdminKycService kycService;
    
    public AdminKycController(AdminKycService kycService) {
        this.kycService = kycService;
    }
    
    @GetMapping
    public PagedResponse<KycAdminDto> getKycRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return kycService.getKycRequests(page, size, status, search);
    }
    
    @PostMapping("/{documentId}/approve")
    public Map<String, String> approveKyc(
            @PathVariable Long documentId,
            @RequestHeader("Authorization") String authHeader) {
        Long adminId = extractAdminIdFromToken(authHeader);
        kycService.approveKyc(documentId, adminId);
        return Map.of("message", "KYC approved successfully");
    }
    
    @PostMapping("/{documentId}/reject")
    public Map<String, String> rejectKyc(
            @PathVariable Long documentId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        Long adminId = extractAdminIdFromToken(authHeader);
        kycService.rejectKyc(documentId, adminId, request.get("reason"));
        return Map.of("message", "KYC rejected successfully");
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getKycStats() {
        return kycService.getKycStats();
    }
    
    private Long extractAdminIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String token = authHeader.substring(7);
        io.jsonwebtoken.Claims claims = com.wallet.wallet_backend.security.JwtUtil.validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}