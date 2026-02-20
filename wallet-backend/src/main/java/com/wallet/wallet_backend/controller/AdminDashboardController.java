package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.AdminDashboardDto;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.AdminDashboardService;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {
    
    private final AdminDashboardService dashboardService;
    
    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping
    public AdminDashboardDto getDashboard(@RequestHeader("Authorization") String authHeader) {
        // Verify admin role
        Long adminId = extractAdminIdFromToken(authHeader);
        return dashboardService.getDashboardStats();
    }
    
    private Long extractAdminIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtil.validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}