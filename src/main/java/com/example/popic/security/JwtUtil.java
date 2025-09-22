package com.example.popic.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.access-exp}") private long accessExp;
    @Value("${jwt.refresh-exp}")private long refreshExp;

    private Key key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(String subject, String role, Long id) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("typ", "access")
                .claim("role", role)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExp))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("typ", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExp))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token);
    }
}