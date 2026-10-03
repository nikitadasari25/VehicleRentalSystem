package com.example.user_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Service used for JWT operations such as validation and username extraction
    private final JwtService jwtService;

    // Service used to load user details from database
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Read Authorization header from request
        String authHeader = request.getHeader("Authorization");

        // If header is missing or does not start with "Bearer ",
        // skip authentication and continue request processing
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token by removing "Bearer " prefix
        String token = authHeader.substring(7);

        // Validate token
        // If token is invalid, continue filter chain without authentication
        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract username/email from JWT token
        String email = jwtService.extractUsername(token);

        // Authenticate only if no authentication already exists
        if (SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            // Load user details from database using email
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(email);

            // Create Authentication object containing user information
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

            // Attach request-specific details such as IP address and session ID
            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));

            // Store authentication object in SecurityContext
            // Spring Security will now treat this user as authenticated
            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
        }

        // Continue processing remaining filters and eventually the controller
        filterChain.doFilter(request, response);
    }
}