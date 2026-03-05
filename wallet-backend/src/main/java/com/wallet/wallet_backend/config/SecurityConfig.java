package com.wallet.wallet_backend.config;

import com.wallet.wallet_backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers(
                                                                "/health",
                                                                "/users/send-otp",
                                                                "/users/verify-otp",
                                                                "/users/set-mpin",
                                                                "/users/verify-mpin",
                                                                "/users/register",
                                                                "/users/create-admin",
                                                                "/users/forgot-mpin/**",
                                                                "/api/admin/login",
                                                                "/users/login-token",
                                                                "/users/login-mpin")
                                                .permitAll()

                                                // ✅ IMPORTANT - PEHLE SPECIFIC, PHIR GENERAL
                                                .requestMatchers("/qr/generate-static")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/qr/generate-payment")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/qr/scan")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/qr/set-upi")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")

                                                // Ya phir ek line mein sab
                                                .requestMatchers("/qr/**")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")

                                                .requestMatchers("/wallet/**")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/payment/**")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/dashboard/**")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/transactions/**")
                                                .hasAnyAuthority("USER", "ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/api/admin/**")
                                                .hasAnyAuthority("ADMIN", "SUPER_ADMIN")

                                                .anyRequest().authenticated())
                                .addFilterBefore(new JwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(Arrays.asList("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}