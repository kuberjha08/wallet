package com.wallet.wallet_backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component; 
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component  // ← YEH ANNOTATION ADD KARO
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                Claims claims = JwtUtil.validateToken(token);

                String userId = claims.getSubject();
                String role = (String) claims.get("role");

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority(role))
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();

        return
                // ✅ FRONTEND ROUTES (Admin portal)
                path.startsWith("/admin") ||
                path.startsWith("/user") ||

                // ✅ STATIC FILES
                path.startsWith("/static") ||
                path.startsWith("/assets") ||

                path.endsWith(".js") ||
                path.endsWith(".css") ||
                path.endsWith(".png") ||
                path.endsWith(".jpg") ||
                path.endsWith(".svg") ||
                path.endsWith(".ico") ||

                path.equals("/") ||
                path.equals("/index.html") ||

                // ✅ PUBLIC APIs
                path.equals("/health") ||
                path.equals("/users/send-otp") ||
                path.equals("/users/verify-otp") ||
                path.equals("/users/set-mpin") ||
                path.equals("/users/verify-mpin") ||
                path.equals("/users/register") ||
                path.equals("/users/create-admin") ||
                path.equals("/api/admin/login") ||
                path.equals("/users/login-token") ||
                path.equals("/users/login-mpin");
    }
}