package com.example.popic.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static javax.crypto.Cipher.SECRET_KEY;

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

    /** ✅ 토큰 유효성 검증 */
    public boolean validateToken(String token) {
        try {
            parse(token); // 성공하면 유효
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** ✅ Claims 꺼내기 */
    public Claims getClaims(String token) {
        return parse(token).getBody();
    }

    /** ✅ userId(혹은 subject) 꺼내기 */
    public String getSubject(String token) {
        return getClaims(token).getSubject();
    }

    // 토큰에서 사용자 정보 추출 후 Authentication 객체 생성
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();

        String username = claims.getSubject(); // JWT에서 sub 필드 사용
        String role = claims.get("role", String.class); // JWT payload에 role 포함

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(role)
        );

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token);
    }
}