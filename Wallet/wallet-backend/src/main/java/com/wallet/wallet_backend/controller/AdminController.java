package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.LoginResponseDto;
import com.wallet.wallet_backend.dto.UserResponseDto;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponseDto adminLogin(@RequestBody AdminLoginRequest request) {
        User admin = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!"ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Not an admin");
        }

        if (!passwordEncoder.matches(request.getMpin(), admin.getMpinHash())) {
            throw new RuntimeException("Invalid MPIN");
        }

        String token = JwtUtil.generateToken(admin.getId(), "ADMIN");
        String permanentToken = admin.getPermanentToken();
        
        // If admin doesn't have permanent token, generate one
        if (permanentToken == null) {
            permanentToken = "ADMIN_PERM_" + System.currentTimeMillis();
            admin.setPermanentToken(permanentToken);
            admin.setPermanentTokenExpiry(java.time.LocalDateTime.now().plusDays(30));
            userRepository.save(admin);
        }

        // Create LoginResponseDto with permanent token
        UserResponseDto userDto = mapToDto(admin);
        return new LoginResponseDto(token, permanentToken, userDto, "DASHBOARD", "Admin login successful");
    }

    private UserResponseDto mapToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setMobile(user.getMobile());
        dto.setName(user.getName());
        dto.setWalletBalance(user.getWalletBalance());
        dto.setWalletFrozen(user.getWalletFrozen());
        dto.setKycStatus(user.getKycStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setStep("DASHBOARD");
        return dto;
    }

    // Inner DTO class for Admin login
    @Getter
    @Setter
    static class AdminLoginRequest {
        private String mobile;
        private String mpin;
    }
}