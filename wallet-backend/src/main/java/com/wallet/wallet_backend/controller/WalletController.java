package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.WalletRequestDto;
import com.wallet.wallet_backend.dto.WalletTransactionResponseDto;
import com.wallet.wallet_backend.service.WalletService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/wallet")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/credit")
    public String credit(@RequestBody WalletRequestDto request) {
        walletService.credit(request.getUserId(), request.getAmount(), request.getReference());
        return "Wallet credited successfully";
    }

    @PostMapping("/debit")
    public String debit(@RequestBody WalletRequestDto request) {
        walletService.debit(request.getUserId(), request.getAmount(), request.getReference());
        return "Wallet debited successfully";
    }

    @GetMapping("/statement")
    public List<WalletTransactionResponseDto> statement(@RequestParam Long userId) {
        return walletService.getStatement(userId);
    }
}