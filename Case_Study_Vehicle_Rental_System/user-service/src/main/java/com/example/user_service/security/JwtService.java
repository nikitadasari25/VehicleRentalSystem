package com.example.user_service.security;

import com.example.user_service.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service

public class JwtService {

    @Value("${jwt.secret}")

    private String secret;

    @Value("${jwt.expiration}")

    private long expiration;

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(secret.getBytes());

    }

    public String generateToken(User user) {

        return Jwts.builder()

                .subject(user.getEmail())

                .claim("role", user.getRole().name())

                .claim("userId", user.getId())

                .issuedAt(new Date())

                .expiration(new Date(System.currentTimeMillis() + expiration))

                .signWith(getSigningKey())

                .compact();

    }

    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();

    }

    public String extractRole(String token) {

        return extractAllClaims(token)

                .get("role", String.class);

    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()

                .verifyWith(getSigningKey())

                .build()

                .parseSignedClaims(token)

                .getPayload();

    }

    public boolean isTokenValid(String token) {

        try {

            extractAllClaims(token);

            return true;

        } catch (Exception e) {

            return false;

        }

    }

}
 