package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.*;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import com.wallet.wallet_backend.service.UserService;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserController(UserService userService, 
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // 1. Send OTP
    @PostMapping("/send-otp")
    public LoginResponseDto sendOtp(@RequestBody SendOtpSimpleRequest request) {
        return userService.sendOtp(request.getMobile());
    }
    
    // 2. Verify OTP
    @PostMapping("/verify-otp")
    public LoginResponseDto verifyOtp(@RequestBody VerifyOtpRequestDto request) {
        return userService.verifyOtp(request.getMobile(), request.getOtp(), request.getTempToken());
    }
    
    // 3. Register
    @PostMapping("/register")
    public LoginResponseDto register(@RequestBody RegisterRequestDto request) {
        return userService.register(request.getMobile(), request.getName(), request.getTempToken());
    }
    
    // 4. Set MPIN - Returns JWT token + Permanent token
    @PostMapping("/set-mpin")
    public LoginResponseDto setMpin(@RequestBody SetMpinRequestDto request) {
        return userService.setMpin(request.getToken(), request.getMpin());
    }
    
    // 5. Verify MPIN - Returns JWT token + Permanent token (MAIN API)
    @PostMapping("/verify-mpin")
    public LoginResponseDto verifyMpin(@RequestBody VerifyMpinRequestDto request) {
        return userService.verifyMpin(request.getToken(), request.getMpin());
    }
    
    // 6. Login with PERMANENT token (Optional - for app restart)
    @PostMapping("/login-token")
    public LoginResponseDto loginWithPermanentToken(@RequestBody LoginWithPermanentTokenRequest request) {
        return userService.loginWithPermanentToken(request.getMobile(), request.getPermanentToken());
    }
    
    // 7. Login with MPIN directly (Optional - skip OTP)
    @PostMapping("/login-mpin")
    public LoginResponseDto loginWithMpin(@RequestBody LoginRequestDto request) {
        return userService.loginWithMpin(request.getMobile(), request.getMpin());
    }
    
    // 8. Get permanent token (for testing)
    @GetMapping("/permanent-token")
    public String getPermanentToken(@RequestParam Long userId) {
        return userService.getPermanentToken(userId);
    }
    
    // 9. Edit Profile
    @PutMapping("/profile")
    public UserResponseDto updateProfile(@RequestBody UpdateProfileRequestDto request,
                                        @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        return userService.updateProfile(userId, request);
    }
    
    // 10. Change MPIN
    @PostMapping("/change-mpin")
    public String changeMpin(@RequestBody ChangeMpinRequestDto request,
                            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserIdFromToken(authHeader);
        return userService.changeMpin(userId, request.getOldMpin(), request.getNewMpin());
    }
    
    // 11. Forgot MPIN - Step 1: Send OTP
    @PostMapping("/forgot-mpin/send-otp")
    public String sendOtpForForgotMpin(@RequestBody ForgotMpinSendOtpRequest request) {
        // Generate and send OTP for forgot MPIN
        String otp = userService.generateOtpForForgotMpin(request.getMobile());
        return "OTP sent for MPIN reset";
    }
    
    // 12. Forgot MPIN - Step 2: Reset MPIN
    @PostMapping("/forgot-mpin/reset")
    public String resetMpin(@RequestBody ForgotMpinResetRequest request) {
        return userService.forgotMpin(request.getMobile(), request.getOtp(), request.getNewMpin());
    }
    
    // Create admin
    @PostMapping("/create-admin")
    public UserResponseDto createAdmin(@RequestBody CreateAdminRequestDto request) {
        Optional<User> existing = userRepository.findByMobile(request.getMobile());
        if (existing.isPresent()) throw new RuntimeException("Admin exists");
        if (request.getMpin().length() != 4) throw new RuntimeException("MPIN 4 digits");
        
        User admin = new User();
        admin.setMobile(request.getMobile());
        admin.setName(request.getName());
        admin.setMpinHash(passwordEncoder.encode(request.getMpin()));
        admin.setWalletBalance(0.0);
        admin.setWalletFrozen(false);
        admin.setKycStatus("APPROVED");
        admin.setRole("ADMIN");
        admin.setStep("DASHBOARD");
        admin.setCreatedAt(LocalDateTime.now());
        
        String permanentToken = "ADMIN_PERM_" + System.currentTimeMillis();
        admin.setPermanentToken(permanentToken);
        admin.setPermanentTokenExpiry(LocalDateTime.now().plusDays(30));
        
        admin = userRepository.save(admin);
        
        UserResponseDto dto = new UserResponseDto();
        dto.setId(admin.getId());
        dto.setMobile(admin.getMobile());
        dto.setName(admin.getName());
        dto.setStep(admin.getStep());
        return dto;
    }
    
    // Helper method to extract user ID from token
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid token");
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtil.validateToken(token);
        return Long.parseLong(claims.getSubject());
    }
}