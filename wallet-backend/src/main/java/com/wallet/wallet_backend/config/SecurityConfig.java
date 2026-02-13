package com.wallet.wallet_backend.config;

import com.wallet.wallet_backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/health",
                                "/users/send-otp",
                                "/users/verify-otp",
                                "/users/set-mpin",
                                "/users/verify-mpin",
                                "/users/register",
                                "/users/create-admin",
                                "/users/forgot-mpin/**",
                                "/admin/login",
                                "/users/login-token",
                                "/users/login-mpin"
                        ).permitAll()
                        // FIX: Allow both USER and ADMIN for wallet operations
                        .requestMatchers("/wallet/**").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/payment/**").hasAuthority("USER")
                        .requestMatchers("/qr/**").hasAuthority("USER")
                        .requestMatchers("/dashboard/**").hasAuthority("USER")
                        // FIX: Admin wallet management
                        .requestMatchers("/admin/wallet-management/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}