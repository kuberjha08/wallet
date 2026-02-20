package com.wallet.wallet_backend.controller;

import com.wallet.wallet_backend.dto.AdminUserDetailDto;
import com.wallet.wallet_backend.dto.PagedResponse;
import com.wallet.wallet_backend.dto.UserAdminDto;
import com.wallet.wallet_backend.service.AdminUserService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {
    
    private final AdminUserService userService;
    
    public AdminUserController(AdminUserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    public PagedResponse<UserAdminDto> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return userService.getUsers(page, size, search);
    }
    
    @GetMapping("/{userId}")
    public AdminUserDetailDto getUserDetails(@PathVariable Long userId) {
        return userService.getUserDetails(userId);
    }
    
    @PutMapping("/{userId}")
    public UserAdminDto updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        return userService.updateUser(userId, updates);
    }
    
    @PostMapping("/{userId}/freeze")
    public Map<String, String> freezeUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        userService.freezeUserWallet(userId, request.get("reason"));
        return Map.of("message", "User wallet frozen successfully");
    }
    
    @PostMapping("/{userId}/unfreeze")
    public Map<String, String> unfreezeUser(@PathVariable Long userId) {
        userService.unfreezeUserWallet(userId);
        return Map.of("message", "User wallet unfrozen successfully");
    }
    
    @GetMapping("/stats")
    public Map<String, Object> getUserStats() {
        return userService.getUserStats();
    }
}