package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminWalletService {

    private final UserRepository userRepository;

    public AdminWalletService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void freezeWallet(Long userId, String reason) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletFrozen(true);
        userRepository.save(user);
    }

    @Transactional
    public void unfreezeWallet(Long userId) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletFrozen(false);
        userRepository.save(user);
    }
}