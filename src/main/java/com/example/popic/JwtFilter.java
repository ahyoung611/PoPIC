package com.example.popic;

import com.example.popic.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

//         토큰이 없으면 401 반환
//        if (token == null) {
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
//            response.setContentType("application/json");
//            response.getWriter().write("{\"message\": \"토큰이 없습니다.\"}");
//            return;
//        }

        if (token != null && jwtUtil.validateToken(token)) {
            // JWT에서 claims 꺼내기
            Claims claims = jwtUtil.parse(token).getBody();
            Long userId = claims.get("id", Long.class);
            String username = claims.getSubject();
            String role = claims.get("role", String.class);

            // Custom principal 생성
            CustomUserPrincipal principal = new CustomUserPrincipal(userId, username, role);

            // Authentication 객체 생성
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

//    @Override
//    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
//        String path = request.getServletPath();
//
//        // 제외할 URL 리스트
//        return path.equals("/**")
//                || path.equals("/user/login")
//                || path.equals("/auth/refresh");
//    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // // 추가: CORS preflight는 항상 패스
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true; // 추가

        String uri = request.getRequestURI();

        // // 추가: JWT 검사 제외할 경로들
        // prefix는 startsWith, 단건은 equals로 처리
        if (uri.startsWith("/auth/")) return true;                  // 추가: /auth/google/callback, /auth/refresh 등
        if (uri.equals("/user/login")) return true;                 // 추가
        if (uri.equals("/vendor/login")) return true;               // 추가
        if (uri.equals("/admin/login")) return true;                // 추가

        // (선택) 정적/문서화/헬스체크 등도 제외하고 싶으면 아래 열기
        if (uri.startsWith("/swagger-ui")) return true;             // 추가
        if (uri.startsWith("/v3/api-docs")) return true;            // 추가
        if (uri.startsWith("/error")) return true;                  // 추가
        if (uri.startsWith("/favicon")) return true;                // 추가
        if (uri.startsWith("/css/") || uri.startsWith("/js/") || uri.startsWith("/images/")) return true; // 추가

        return false; // 기본: 필터 적용
    }

}
