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
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Add this line
                .csrf(csrf -> csrf.disable())
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
                                "/users/login-mpin")
                        .permitAll()
                        .requestMatchers("/wallet/**").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/payment/**").hasAuthority("USER")
                        .requestMatchers("/qr/**").hasAuthority("USER")
                        .requestMatchers("/dashboard/**").hasAuthority("USER")

                        // Admin endpoints
                        .requestMatchers("/admin/dashboard/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/users/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/kyc/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/transactions/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/wallet-management/**").hasAuthority("ADMIN")
                        .requestMatchers("/admin/reports/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://16.171.153.74:1433",
    "http://16.171.153.74:8080",
    "http://16.171.153.74"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE",
    "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new
    UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
    }
    // @Bean
    // public CorsConfigurationSource corsConfigurationSource() {
    //     CorsConfiguration configuration = new CorsConfiguration();
    //     configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    //     configuration.setAllowedMethods(Arrays.asList("*"));
    //     configuration.setAllowedHeaders(Arrays.asList("*"));
    //     configuration.setAllowCredentials(false); // IMPORTANT
    //     configuration.setMaxAge(3600L);

    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     source.registerCorsConfiguration("/**", configuration);
    //     return source;
    // }
}