package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.WalletAdminDto;
import com.wallet.wallet_backend.service.AdminWalletService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/wallet-management")
public class AdminWalletManagementController {
    
    private final AdminWalletService walletService;
    
    public AdminWalletManagementController(AdminWalletService walletService) {
        this.walletService = walletService;
    }
    
    @GetMapping("/overview")
    public Map<String, Object> getWalletOverview() {
        return walletService.getWalletOverview();
    }
    
    @GetMapping("/users")
    public List<WalletAdminDto> getUserWallets(@RequestParam(required = false) String search) {
        return walletService.getUserWallets(search);
    }
    
    @GetMapping("/recent-transactions")
    public List<Map<String, Object>> getRecentTransactions(@RequestParam(defaultValue = "5") int limit) {
        return walletService.getRecentWalletTransactions(limit);
    }
    
    @PostMapping("/adjust")
    public Map<String, String> adjustWallet(@RequestBody Map<String, Object> request) {
        Long userId = Long.parseLong(request.get("userId").toString());
        Double amount = Double.parseDouble(request.get("amount").toString());
        String type = (String) request.get("type");
        String reason = (String) request.get("reason");
        
        walletService.adjustWallet(userId, amount, type, reason);
        return Map.of("message", "Wallet adjusted successfully");
    }
    
    @PostMapping("/bulk-credit")
    public Map<String, String> bulkCredit(@RequestBody Map<String, Object> request) {
        // FIX: Convert Integer to Long properly
        List<Integer> userIdsInt = (List<Integer>) request.get("userIds");
        List<Long> userIds = userIdsInt.stream()
                .map(Integer::longValue)
                .collect(Collectors.toList());
        
        Double amount = Double.parseDouble(request.get("amount").toString());
        String reason = (String) request.get("reason");
        
        walletService.bulkCredit(userIds, amount, reason);
        return Map.of("message", "Bulk credit completed");
    }
    
    @PostMapping("/bulk-freeze")
    public Map<String, String> bulkFreeze(@RequestBody List<Integer> userIdsInt) {
        // FIX: Convert Integer to Long properly
        List<Long> userIds = userIdsInt.stream()
                .map(Integer::longValue)
                .collect(Collectors.toList());
        
        walletService.bulkFreeze(userIds);
        return Map.of("message", "Bulk freeze completed");
    }
}