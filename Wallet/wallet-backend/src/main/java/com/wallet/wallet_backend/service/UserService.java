package com.wallet.wallet_backend.service;

import com.wallet.wallet_backend.dto.*;
import com.wallet.wallet_backend.entity.User;
import com.wallet.wallet_backend.repository.UserRepository;
import com.wallet.wallet_backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, OtpService otpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    @Transactional
    public LoginResponseDto sendOtp(String mobile) {
        Optional<User> existingUser = userRepository.findByMobile(mobile);
        String otp = otpService.generateOtp();

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            String tempToken = otpService.generateTempToken(user.getId(), user.getMobile());

            user.setOtp(otp);
            user.setOtpExpiry(otpService.getOtpExpiryTime());
            user.setTempToken(tempToken);
            user.setStep("VERIFY_OTP");

            userRepository.save(user);

            System.out.println("✅ OTP for existing user " + mobile + ": " + otp);
            System.out.println("✅ Temp Token saved to DB: " + tempToken);

            return new LoginResponseDto(
                    tempToken,
                    null,
                    null,
                    "VERIFY_OTP",
                    "OTP sent for login");
        } else {
            String tempToken = otpService.generateTempToken(System.currentTimeMillis(), mobile);

            System.out.println("✅ OTP for new user " + mobile + ": " + otp);
            System.out.println("✅ Temp Token (not in DB yet): " + tempToken);

            return new LoginResponseDto(
                    tempToken,
                    null,
                    null,
                    "VERIFY_OTP",
                    "OTP sent for registration");
        }
    }

    @Transactional
    public LoginResponseDto verifyOtp(String mobile, String otp, String tempToken) {
        Optional<User> existingUser = userRepository.findByMobile(mobile);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            System.out.println("🔍 VERIFY OTP - DB Temp Token: " + user.getTempToken());
            System.out.println("🔍 VERIFY OTP - Received Temp Token: " + tempToken);
            System.out.println("🔍 VERIFY OTP - DB OTP: " + user.getOtp());
            System.out.println("🔍 VERIFY OTP - Received OTP: " + otp);
            System.out.println("🔍 VERIFY OTP - User Step: " + user.getStep());

            if (!"VERIFY_OTP".equals(user.getStep())) {
                throw new RuntimeException("User not in VERIFY_OTP step. Current step: " + user.getStep());
            }

            if (user.getTempToken() == null || !tempToken.equals(user.getTempToken())) {
                throw new RuntimeException("Invalid or expired temporary token");
            }

            if (user.getOtp() == null || !otp.equals(user.getOtp())) {
                throw new RuntimeException("Invalid OTP");
            }

            if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
                throw new RuntimeException("OTP expired");
            }

            String newTempToken = otpService.generateTempToken(user.getId(), user.getMobile());

            user.setTempToken(newTempToken);
            user.setStep("VERIFY_MPIN");
            user.setOtp(null);
            user.setOtpExpiry(null);

            userRepository.save(user);

            System.out.println("✅ Generated new temp token for verify-mpin: " + newTempToken);

            return new LoginResponseDto(
                    newTempToken,
                    null,
                    null,
                    "VERIFY_MPIN",
                    "OTP verified. Please enter MPIN");
        } else {
            String newTempToken = otpService.generateTempToken(System.currentTimeMillis(), mobile);

            return new LoginResponseDto(
                    newTempToken,
                    null,
                    null,
                    "REGISTER",
                    "OTP verified. Please register");
        }
    }

    @Transactional
    public LoginResponseDto register(String mobile, String name, String tempToken) {
        if (userRepository.findByMobile(mobile).isPresent()) {
            throw new RuntimeException("User already exists with this mobile");
        }

        User user = new User();
        user.setMobile(mobile);
        user.setName(name);
        user.setKycStatus("PENDING");
        user.setWalletBalance(0.0);
        user.setWalletFrozen(false);
        user.setRole("USER");
        user.setStep("SET_MPIN");
        user.setCreatedAt(LocalDateTime.now());

        String newTempToken = otpService.generateTempToken(System.currentTimeMillis(), mobile);
        user.setTempToken(newTempToken);

        user = userRepository.save(user);

        return new LoginResponseDto(
                newTempToken,
                null,
                mapToDto(user),
                "SET_MPIN",
                "Registration successful. Please set MPIN");
    }

    @Transactional
    public LoginResponseDto setMpin(String token, String mpin) {
        User user = userRepository.findByTempToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token. Token: " + token));

        System.out.println("=== DEBUG SET MPIN ===");
        System.out.println("Looking for token: " + token);
        System.out.println("Found user: " + user.getMobile());
        System.out.println("User step: " + user.getStep());
        System.out.println("=====================");

        if (!"SET_MPIN".equals(user.getStep())) {
            throw new RuntimeException("Invalid step. Expected SET_MPIN, found: " + user.getStep());
        }

        if (mpin.length() != 4) {
            throw new RuntimeException("MPIN must be 4 digits");
        }

        user.setMpinHash(passwordEncoder.encode(mpin));
        user.setStep("DASHBOARD");

        String permanentToken = otpService.generatePermanentToken(user.getId(), user.getMobile());
        user.setPermanentToken(permanentToken);
        user.setPermanentTokenExpiry(otpService.getTokenExpiryTime());
        user.setTempToken(null);

        userRepository.save(user);

        String jwtToken = JwtUtil.generateToken(user.getId(), user.getRole());

        return new LoginResponseDto(
                jwtToken,
                permanentToken,
                mapToDto(user),
                "DASHBOARD",
                "MPIN set successfully");
    }

    @Transactional
    public LoginResponseDto verifyMpin(String token, String mpin) {
        System.out.println("=== DEBUG VERIFY MPIN ===");
        System.out.println("Looking for token: " + token);
        
        User user;
        boolean isTempTokenFlow = true;
        
        // First try to find by TEMP token (normal OTP flow)
        Optional<User> tempTokenUser = userRepository.findByTempToken(token);
        
        if (tempTokenUser.isPresent()) {
            user = tempTokenUser.get();
            System.out.println("✅ Found user by TEMP token: " + user.getMobile());
            
            // Validate step for temp token flow
            if (!"VERIFY_MPIN".equals(user.getStep())) {
                throw new RuntimeException("Invalid step. Expected VERIFY_MPIN, found: " + user.getStep());
            }
        } 
        // If not found by temp token, try PERMANENT token
        else {
            Optional<User> permTokenUser = userRepository.findByPermanentToken(token);
            if (permTokenUser.isPresent()) {
                user = permTokenUser.get();
                isTempTokenFlow = false;
                System.out.println("✅ Found user by PERMANENT token: " + user.getMobile());
            } else {
                throw new RuntimeException("Invalid token. Not found in temp or permanent tokens");
            }
        }

        System.out.println("User step: " + user.getStep());
        System.out.println("Flow type: " + (isTempTokenFlow ? "TEMP_TOKEN" : "PERMANENT_TOKEN"));
        System.out.println("========================");

        // Validate MPIN for both flows
        if (user.getMpinHash() == null) {
            throw new RuntimeException("MPIN not set for user");
        }

        if (!passwordEncoder.matches(mpin, user.getMpinHash())) {
            throw new RuntimeException("Invalid MPIN");
        }

        user.setStep("DASHBOARD");

        String permanentToken;
        
        if (isTempTokenFlow) {
            // Temp token flow: Clear temp token
            user.setTempToken(null);
        }
        
        // Check if we need to generate new permanent token
        if (user.getPermanentToken() != null && 
            user.getPermanentTokenExpiry() != null &&
            LocalDateTime.now().isBefore(user.getPermanentTokenExpiry())) {
            
            // Keep existing permanent token
            permanentToken = user.getPermanentToken();
            System.out.println("✅ Keeping existing permanent token");
        } else {
            // Generate new permanent token
            permanentToken = otpService.generatePermanentToken(user.getId(), user.getMobile());
            user.setPermanentToken(permanentToken);
            user.setPermanentTokenExpiry(otpService.getTokenExpiryTime());
            System.out.println("✅ Generated new permanent token");
        }

        userRepository.save(user);

        String jwtToken = JwtUtil.generateToken(user.getId(), user.getRole());

        return new LoginResponseDto(
                jwtToken,
                permanentToken,
                mapToDto(user),
                "DASHBOARD",
                "Login successful");
    }

    @Transactional
    public LoginResponseDto loginWithPermanentToken(String mobile, String permanentToken) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("=== PERMANENT TOKEN LOGIN ===");
        System.out.println("DB Perm Token: " + user.getPermanentToken());
        System.out.println("Received Perm Token: " + permanentToken);
        System.out.println("Token Expiry: " + user.getPermanentTokenExpiry());
        System.out.println("Current Time: " + LocalDateTime.now());
        System.out.println("=============================");

        if (user.getPermanentToken() == null) {
            throw new RuntimeException("No permanent token found for user");
        }

        if (!user.getPermanentToken().equals(permanentToken)) {
            throw new RuntimeException("Invalid permanent token");
        }

        if (user.getPermanentTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPermanentTokenExpiry())) {
            throw new RuntimeException("Permanent token expired");
        }

        user.setStep("DASHBOARD");
        userRepository.save(user);

        String jwtToken = JwtUtil.generateToken(user.getId(), user.getRole());

        return new LoginResponseDto(
                jwtToken,
                permanentToken,
                mapToDto(user),
                "DASHBOARD",
                "Login successful with saved token");
    }

    @Transactional
    public LoginResponseDto loginWithMpin(String mobile, String mpin) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getMpinHash() == null) {
            throw new RuntimeException("MPIN not set");
        }

        if (!passwordEncoder.matches(mpin, user.getMpinHash())) {
            throw new RuntimeException("Invalid MPIN");
        }

        user.setStep("DASHBOARD");

        String permanentToken;
        
        // Keep existing token if valid
        if (user.getPermanentToken() != null && 
            user.getPermanentTokenExpiry() != null &&
            LocalDateTime.now().isBefore(user.getPermanentTokenExpiry())) {
            
            permanentToken = user.getPermanentToken();
            System.out.println("✅ Keeping existing permanent token for login-mpin");
        } else {
            permanentToken = otpService.generatePermanentToken(user.getId(), user.getMobile());
            user.setPermanentToken(permanentToken);
            user.setPermanentTokenExpiry(otpService.getTokenExpiryTime());
            System.out.println("✅ Generated new permanent token for login-mpin");
        }

        userRepository.save(user);

        String jwtToken = JwtUtil.generateToken(user.getId(), user.getRole());

        return new LoginResponseDto(
                jwtToken,
                permanentToken,
                mapToDto(user),
                "DASHBOARD",
                "Login successful");
    }

    // Profile Management Methods
    @Transactional
    public UserResponseDto updateProfile(Long userId, UpdateProfileRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Check if email is already taken by another user
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(userId)) {
                            throw new RuntimeException("Email already registered");
                        }
                    });
            user.setEmail(request.getEmail());
        }
        
        userRepository.save(user);
        return mapToDto(user);
    }

    @Transactional
    public String changeMpin(Long userId, String oldMpin, String newMpin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getMpinHash() == null) {
            throw new RuntimeException("MPIN not set");
        }
        
        if (!passwordEncoder.matches(oldMpin, user.getMpinHash())) {
            throw new RuntimeException("Invalid old MPIN");
        }
        
        if (newMpin.length() != 4) {
            throw new RuntimeException("MPIN must be 4 digits");
        }
        
        user.setMpinHash(passwordEncoder.encode(newMpin));
        userRepository.save(user);
        
        return "MPIN changed successfully";
    }

    public String generateOtpForForgotMpin(String mobile) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(otpService.getOtpExpiryTime());
        userRepository.save(user);
        
        System.out.println("Forgot MPIN OTP for " + mobile + ": " + otp);
        return otp;
    }

    @Transactional
    public String forgotMpin(String mobile, String otp, String newMpin) {
        User user = userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate OTP
        if (user.getOtp() == null || !otp.equals(user.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP expired");
        }
        
        if (newMpin.length() != 4) {
            throw new RuntimeException("MPIN must be 4 digits");
        }
        
        user.setMpinHash(passwordEncoder.encode(newMpin));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        return "MPIN reset successfully";
    }

    public String getPermanentToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPermanentToken();
    }

    private UserResponseDto mapToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setMobile(user.getMobile());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setWalletBalance(user.getWalletBalance());
        dto.setWalletFrozen(user.getWalletFrozen());
        dto.setKycStatus(user.getKycStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setStep(user.getStep());
        dto.setUpiId(user.getUpiId());
        dto.setQrCodeData(user.getQrCodeData());
        return dto;
    }
}