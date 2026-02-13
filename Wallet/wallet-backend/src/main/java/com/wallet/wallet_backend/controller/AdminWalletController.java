package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.service.AdminWalletService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/wallet")
public class AdminWalletController {

    private final AdminWalletService adminWalletService;

    public AdminWalletController(AdminWalletService adminWalletService) {
        this.adminWalletService = adminWalletService;
    }

    @PostMapping("/freeze")
    public String freeze(@RequestParam Long userId,
                         @RequestParam(required = false) String reason) {
        adminWalletService.freezeWallet(userId, reason);
        return "Wallet frozen successfully";
    }

    @PostMapping("/unfreeze")
    public String unfreeze(@RequestParam Long userId) {
        adminWalletService.unfreezeWallet(userId);
        return "Wallet unfrozen successfully";
    }
}